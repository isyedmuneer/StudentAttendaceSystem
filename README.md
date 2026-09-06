# Student Attendance Application

A full-stack sample application for a deployment showcase.

- **Frontend**: React (Vite) + Tailwind CSS + Recharts
- **Backend**: FastAPI + SQLAlchemy + Alembic
- **Database**: PostgreSQL
- **Deployment**: Docker Compose (frontend served by nginx, proxying `/api` to the backend)

## Features

- JWT authentication (admin / teacher roles)
- Student CRUD with search
- Course CRUD with enrollment management
- Take-attendance roster view (bulk mark present/absent/late/excused per course/date)
- Attendance history with filters (course, student, date range)
- Dashboard with summary stats and charts (per-course attendance rate, today's breakdown)

## Running with Docker

```bash
cp .env.example .env   # edit values if desired
docker compose up --build
```

- Frontend: http://localhost:8080 (override with `FRONTEND_PORT` in `.env`)
- Backend API docs: http://localhost:8000/docs
- Postgres is only reachable from within the Docker network (service name `db`), not exposed to the host

The backend container runs `alembic upgrade head` automatically on startup, so the schema is always up to date.

### Seed demo data

After the stack is up, seed an admin/teacher user and sample students/courses:

```bash
docker compose exec backend python -m app.seed
```

Demo accounts:
- `admin` / `admin123`
- `teacher` / `teacher123`

## Local development (without Docker)

### Backend

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # point DATABASE_URL at a local Postgres instance
alembic upgrade head
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server proxies `/api` requests to `http://localhost:8000` (override with `VITE_API_PROXY_TARGET`).

## Project structure

```
backend/
  app/
    main.py          FastAPI app + router registration
    models.py         SQLAlchemy models
    schemas.py         Pydantic schemas
    security.py        JWT auth, password hashing
    routers/            auth, students, courses, attendance, dashboard
    seed.py             demo data seeding script
  alembic/               database migrations
frontend/
  src/
    api/                 axios client + API calls
    context/AuthContext   auth state
    components/           Layout, ProtectedRoute, Modal, StatCard
    pages/                Dashboard, Students, Courses, CourseDetail,
                          TakeAttendance, AttendanceHistory, Login
docker-compose.yml
```
