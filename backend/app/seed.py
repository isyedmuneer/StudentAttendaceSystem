"""Seed the database with an initial admin user and sample data.

Run inside the backend container after migrations have applied:
    docker compose exec backend python -m app.seed
"""

from datetime import date, timedelta

from app.database import SessionLocal
from app.models import AttendanceRecord, AttendanceStatus, Course, Student, User, UserRole
from app.security import hash_password


def run():
    db = SessionLocal()
    try:
        if db.query(User).filter(User.username == "admin").first():
            print("Seed data already present, skipping.")
            return

        admin = User(
            username="admin",
            email="admin@example.com",
            full_name="System Administrator",
            hashed_password=hash_password("admin123"),
            role=UserRole.admin,
        )
        teacher = User(
            username="teacher",
            email="teacher@example.com",
            full_name="Jane Teacher",
            hashed_password=hash_password("teacher123"),
            role=UserRole.teacher,
        )
        db.add_all([admin, teacher])
        db.flush()

        course_math = Course(name="Mathematics 101", code="MATH101", description="Intro to algebra", teacher_id=teacher.id)
        course_sci = Course(name="Science 101", code="SCI101", description="Intro to physical science", teacher_id=teacher.id)
        db.add_all([course_math, course_sci])
        db.flush()

        students = [
            Student(first_name="Alice", last_name="Anderson", roll_number="R001", email="alice@example.com"),
            Student(first_name="Bob", last_name="Brown", roll_number="R002", email="bob@example.com"),
            Student(first_name="Carla", last_name="Costa", roll_number="R003", email="carla@example.com"),
            Student(first_name="David", last_name="Diaz", roll_number="R004", email="david@example.com"),
        ]
        db.add_all(students)
        db.flush()

        for s in students:
            course_math.students.append(s)
        for s in students[:3]:
            course_sci.students.append(s)
        db.flush()

        statuses = [AttendanceStatus.present, AttendanceStatus.present, AttendanceStatus.absent, AttendanceStatus.late]
        for day_offset in range(5):
            day = date.today() - timedelta(days=day_offset)
            for i, s in enumerate(students):
                db.add(
                    AttendanceRecord(
                        student_id=s.id,
                        course_id=course_math.id,
                        date=day,
                        status=statuses[(i + day_offset) % len(statuses)],
                        marked_by=teacher.id,
                    )
                )

        db.commit()
        print("Seed data created: admin/admin123, teacher/teacher123")
    finally:
        db.close()


if __name__ == "__main__":
    run()
