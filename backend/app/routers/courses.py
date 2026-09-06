from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import Course, Student, User
from app.schemas import CourseCreate, CourseRead, CourseUpdate, EnrollmentRequest, StudentRead
from app.security import get_current_user

router = APIRouter(prefix="/api/courses", tags=["courses"])


def _to_course_read(course: Course) -> CourseRead:
    data = CourseRead.model_validate(course)
    data.student_count = len(course.students)
    return data


@router.get("", response_model=list[CourseRead])
def list_courses(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    courses = db.query(Course).options(joinedload(Course.teacher), joinedload(Course.students)).all()
    return [_to_course_read(c) for c in courses]


@router.post("", response_model=CourseRead, status_code=status.HTTP_201_CREATED)
def create_course(payload: CourseCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if db.query(Course).filter(Course.code == payload.code).first():
        raise HTTPException(status_code=400, detail="Course code already exists")
    course = Course(**payload.model_dump())
    db.add(course)
    db.commit()
    db.refresh(course)
    return _to_course_read(course)


@router.get("/{course_id}", response_model=CourseRead)
def get_course(course_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    course = db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return _to_course_read(course)


@router.put("/{course_id}", response_model=CourseRead)
def update_course(
    course_id: int,
    payload: CourseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    course = db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(course, field, value)
    db.commit()
    db.refresh(course)
    return _to_course_read(course)


@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_course(course_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    course = db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    db.delete(course)
    db.commit()


@router.get("/{course_id}/students", response_model=list[StudentRead])
def list_course_students(course_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    course = db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course.students


@router.post("/{course_id}/enroll", response_model=list[StudentRead])
def enroll_student(
    course_id: int,
    payload: EnrollmentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    course = db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    student = db.get(Student, payload.student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    if student not in course.students:
        course.students.append(student)
        db.commit()
    db.refresh(course)
    return course.students


@router.delete("/{course_id}/enroll/{student_id}", response_model=list[StudentRead])
def unenroll_student(
    course_id: int,
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    course = db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    student = db.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    if student in course.students:
        course.students.remove(student)
        db.commit()
    db.refresh(course)
    return course.students
