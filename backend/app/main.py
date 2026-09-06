from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import attendance, auth, courses, dashboard, students

app = FastAPI(title="Student Attendance API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(students.router)
app.include_router(courses.router)
app.include_router(attendance.router)
app.include_router(dashboard.router)


@app.get("/api/health", tags=["health"])
def health_check():
    return {"status": "ok"}
