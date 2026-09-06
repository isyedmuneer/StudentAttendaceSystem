from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AttendanceRecord, Course, User
from app.schemas import (
    AttendanceCreate,
    AttendanceRead,
    AttendanceRosterEntry,
    AttendanceUpdate,
    BulkAttendanceRequest,
)
from app.security import get_current_user

router = APIRouter(prefix="/api/attendance", tags=["attendance"])


@router.get("", response_model=list[AttendanceRead])
def list_attendance(
    course_id: int | None = None,
    student_id: int | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(AttendanceRecord)
    if course_id is not None:
        query = query.filter(AttendanceRecord.course_id == course_id)
    if student_id is not None:
        query = query.filter(AttendanceRecord.student_id == student_id)
    if date_from is not None:
        query = query.filter(AttendanceRecord.date >= date_from)
    if date_to is not None:
        query = query.filter(AttendanceRecord.date <= date_to)
    return query.order_by(AttendanceRecord.date.desc()).all()


@router.get("/roster", response_model=list[AttendanceRosterEntry])
def get_roster(
    course_id: int,
    for_date: date = Query(..., alias="date"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    course = db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    existing = {
        rec.student_id: rec
        for rec in db.query(AttendanceRecord).filter(
            AttendanceRecord.course_id == course_id, AttendanceRecord.date == for_date
        )
    }

    roster = []
    for student in sorted(course.students, key=lambda s: (s.last_name, s.first_name)):
        record = existing.get(student.id)
        roster.append(
            AttendanceRosterEntry(
                student_id=student.id,
                first_name=student.first_name,
                last_name=student.last_name,
                roll_number=student.roll_number,
                status=record.status if record else None,
                attendance_id=record.id if record else None,
            )
        )
    return roster


@router.post("/bulk", response_model=list[AttendanceRead])
def mark_bulk_attendance(
    payload: BulkAttendanceRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    course = db.get(Course, payload.course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    existing = {
        rec.student_id: rec
        for rec in db.query(AttendanceRecord).filter(
            AttendanceRecord.course_id == payload.course_id, AttendanceRecord.date == payload.date
        )
    }

    results = []
    for entry in payload.entries:
        record = existing.get(entry.student_id)
        if record:
            record.status = entry.status
            record.marked_by = current_user.id
        else:
            record = AttendanceRecord(
                student_id=entry.student_id,
                course_id=payload.course_id,
                date=payload.date,
                status=entry.status,
                marked_by=current_user.id,
            )
            db.add(record)
        results.append(record)

    db.commit()
    for record in results:
        db.refresh(record)
    return results


@router.post("", response_model=AttendanceRead, status_code=status.HTTP_201_CREATED)
def mark_attendance(payload: AttendanceCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = (
        db.query(AttendanceRecord)
        .filter(
            AttendanceRecord.student_id == payload.student_id,
            AttendanceRecord.course_id == payload.course_id,
            AttendanceRecord.date == payload.date,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Attendance already recorded for this student/course/date")

    record = AttendanceRecord(**payload.model_dump(), marked_by=current_user.id)
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.put("/{attendance_id}", response_model=AttendanceRead)
def update_attendance(
    attendance_id: int,
    payload: AttendanceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    record = db.get(AttendanceRecord, attendance_id)
    if not record:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    record.status = payload.status
    record.marked_by = current_user.id
    db.commit()
    db.refresh(record)
    return record


@router.delete("/{attendance_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_attendance(attendance_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    record = db.get(AttendanceRecord, attendance_id)
    if not record:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    db.delete(record)
    db.commit()
