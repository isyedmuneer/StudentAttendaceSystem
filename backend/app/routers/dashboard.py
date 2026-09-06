from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AttendanceRecord, AttendanceStatus, Course, Student, User
from app.schemas import CourseAttendanceStat, DashboardSummary, StudentAttendanceStat
from app.security import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummary)
def get_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    total_students = db.query(func.count(Student.id)).filter(Student.is_active.is_(True)).scalar() or 0
    total_courses = db.query(func.count(Course.id)).filter(Course.is_active.is_(True)).scalar() or 0
    total_teachers = db.query(func.count(User.id)).scalar() or 0

    today = date.today()
    today_records = db.query(AttendanceRecord).filter(AttendanceRecord.date == today).all()
    today_present = sum(1 for r in today_records if r.status == AttendanceStatus.present)
    today_absent = sum(1 for r in today_records if r.status == AttendanceStatus.absent)
    today_total_marked = len(today_records)

    all_records = db.query(AttendanceRecord.status).all()
    total_all = len(all_records)
    present_all = sum(1 for (status,) in all_records if status == AttendanceStatus.present)
    overall_rate = round((present_all / total_all) * 100, 1) if total_all else 0.0

    return DashboardSummary(
        total_students=total_students,
        total_courses=total_courses,
        total_teachers=total_teachers,
        today_present=today_present,
        today_absent=today_absent,
        today_total_marked=today_total_marked,
        overall_attendance_rate=overall_rate,
    )


@router.get("/courses", response_model=list[CourseAttendanceStat])
def get_course_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    courses = db.query(Course).all()
    stats = []
    for course in courses:
        records = db.query(AttendanceRecord).filter(AttendanceRecord.course_id == course.id).all()
        present = sum(1 for r in records if r.status == AttendanceStatus.present)
        absent = sum(1 for r in records if r.status == AttendanceStatus.absent)
        late = sum(1 for r in records if r.status == AttendanceStatus.late)
        excused = sum(1 for r in records if r.status == AttendanceStatus.excused)
        total = len(records)
        rate = round((present / total) * 100, 1) if total else 0.0
        stats.append(
            CourseAttendanceStat(
                course_id=course.id,
                course_name=course.name,
                present=present,
                absent=absent,
                late=late,
                excused=excused,
                attendance_rate=rate,
            )
        )
    return stats


@router.get("/student/{student_id}", response_model=list[StudentAttendanceStat])
def get_student_stats(student_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    student = db.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    stats = []
    for course in student.courses:
        records = db.query(AttendanceRecord).filter(
            AttendanceRecord.student_id == student_id, AttendanceRecord.course_id == course.id
        ).all()
        present = sum(1 for r in records if r.status == AttendanceStatus.present)
        absent = sum(1 for r in records if r.status == AttendanceStatus.absent)
        late = sum(1 for r in records if r.status == AttendanceStatus.late)
        excused = sum(1 for r in records if r.status == AttendanceStatus.excused)
        total = len(records)
        rate = round((present / total) * 100, 1) if total else 0.0
        stats.append(
            StudentAttendanceStat(
                course_id=course.id,
                course_name=course.name,
                present=present,
                absent=absent,
                late=late,
                excused=excused,
                total=total,
                attendance_rate=rate,
            )
        )
    return stats
