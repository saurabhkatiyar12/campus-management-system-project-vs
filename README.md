# Campus Management System

Full-stack college management app built with:
- Frontend: React + Vite
- Backend: Express.js
- Auth: JWT + role-based authorization
- Storage: JSON files in `server/data/` (no external database)

## Features
- Role-based login: `admin`, `faculty`, `student`
- User management (admin)
- Attendance marking and reports (faculty/admin)
- Assignments create/view/submit
- Notices with audience targeting (`all`, `faculty`, `students`)
- Protected routes and persistent login
- Responsive dashboard layout with mobile sidebar

## Demo Accounts
- Email: `admin@campus.edu`
- Password: `admin123`
- Email: `faculty@campus.edu`
- Password: `faculty123`
- Email: `student@campus.edu`
- Password: `student123`

## Run Locally
```bash
npm install
npm run dev
```

This runs:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

## Scripts
- `npm run dev` - frontend + backend concurrently
- `npm run dev:frontend` - Vite frontend only
- `npm run dev:backend` - Express backend only
- `npm run smoke` - API smoke test (requires backend running on `http://localhost:5000`)
- `npm run smoke:ci` - Starts backend, waits for readiness, runs smoke test, then stops backend
- `npm run lint` - ESLint
- `npm run build` - Production build

## API Overview
- `POST /api/auth/login`
- `POST /api/auth/register` (admin only)
- `GET /api/users` (admin only)
- `GET /api/users/students` (admin/faculty)
- `DELETE /api/users/:id` (admin only)
- `POST /api/attendance` (faculty only)
- `GET /api/attendance`
- `GET /api/attendance/report` (faculty/admin)
- `POST /api/assignments` (faculty only)
- `GET /api/assignments`
- `PUT /api/assignments/:id/submit` (student only)
- `POST /api/notices` (admin/faculty)
- `GET /api/notices` (role-filtered by target audience)
- `DELETE /api/notices/:id` (admin only)

## Data Storage
All persisted data is in:
- `server/data/users.json`
- `server/data/attendance.json`
- `server/data/assignments.json`
- `server/data/notices.json`
