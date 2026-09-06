from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Student, User
from app.schemas import StudentCreate, StudentRead, StudentUpdate
from app.security import get_current_user

router = APIRouter(prefix="/api/students", tags=["students"])


@router.get("", response_model=list[StudentRead])
def list_students(
    search: str | None = Query(None, description="Search by name or roll number"),
    is_active: bool | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Student)
    if search:
        like = f"%{search}%"
        query = query.filter(
            (Student.first_name.ilike(like))
            | (Student.last_name.ilike(like))
            | (Student.roll_number.ilike(like))
        )
    if is_active is not None:
        query = query.filter(Student.is_active == is_active)
    return query.order_by(Student.last_name, Student.first_name).all()


@router.post("", response_model=StudentRead, status_code=status.HTTP_201_CREATED)
def create_student(payload: StudentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if db.query(Student).filter(Student.roll_number == payload.roll_number).first():
        raise HTTPException(status_code=400, detail="Roll number already exists")
    student = Student(**payload.model_dump())
    db.add(student)
    db.commit()
    db.refresh(student)
    return student


@router.get("/{student_id}", response_model=StudentRead)
def get_student(student_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    student = db.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


@router.put("/{student_id}", response_model=StudentRead)
def update_student(
    student_id: int,
    payload: StudentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    student = db.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(student, field, value)
    db.commit()
    db.refresh(student)
    return student


@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student(student_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    student = db.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    db.delete(student)
    db.commit()
