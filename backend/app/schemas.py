from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, EmailStr

from app.models import AttendanceStatus, UserRole


# ---------- Auth ----------
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    full_name: str
    password: str
    role: UserRole = UserRole.teacher


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    email: EmailStr
    full_name: str
    role: UserRole
    is_active: bool
    created_at: datetime


# ---------- Student ----------
class StudentBase(BaseModel):
    first_name: str
    last_name: str
    roll_number: str
    email: EmailStr | None = None
    phone: str | None = None
    is_active: bool = True


class StudentCreate(StudentBase):
    pass


class StudentUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    roll_number: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    is_active: bool | None = None


class StudentRead(StudentBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    enrollment_date: date
    created_at: datetime


# ---------- Course ----------
class CourseBase(BaseModel):
    name: str
    code: str
    description: str | None = None
    teacher_id: int | None = None
    is_active: bool = True


class CourseCreate(CourseBase):
    pass


class CourseUpdate(BaseModel):
    name: str | None = None
    code: str | None = None
    description: str | None = None
    teacher_id: int | None = None
    is_active: bool | None = None


class CourseRead(CourseBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    teacher: UserRead | None = None
    student_count: int = 0


class EnrollmentRequest(BaseModel):
    student_id: int


# ---------- Attendance ----------
class AttendanceBase(BaseModel):
    student_id: int
    course_id: int
    date: date
    status: AttendanceStatus


class AttendanceCreate(AttendanceBase):
    pass


class AttendanceUpdate(BaseModel):
    status: AttendanceStatus


class AttendanceRead(AttendanceBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    marked_by: int | None = None
    created_at: datetime
    updated_at: datetime


class AttendanceRosterEntry(BaseModel):
    student_id: int
    first_name: str
    last_name: str
    roll_number: str
    status: AttendanceStatus | None = None
    attendance_id: int | None = None


class BulkAttendanceEntry(BaseModel):
    student_id: int
    status: AttendanceStatus


class BulkAttendanceRequest(BaseModel):
    course_id: int
    date: date
    entries: list[BulkAttendanceEntry]


# ---------- Dashboard ----------
class DashboardSummary(BaseModel):
    total_students: int
    total_courses: int
    total_teachers: int
    today_present: int
    today_absent: int
    today_total_marked: int
    overall_attendance_rate: float


class CourseAttendanceStat(BaseModel):
    course_id: int
    course_name: str
    present: int
    absent: int
    late: int
    excused: int
    attendance_rate: float


class StudentAttendanceStat(BaseModel):
    course_id: int
    course_name: str
    present: int
    absent: int
    late: int
    excused: int
    total: int
    attendance_rate: float
