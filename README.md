# 🎓 EduSphere — Cloud-Based Education Management System

A full-stack **MERN** (MongoDB · Express · React · Node) college project that automates academic
activities and connects **students, teachers and administrators** on one secure platform.

It features real **JWT authentication with role-based access control**, a complete REST API,
and three role-specific dashboards with live analytics charts.

---

## ✨ Features

### Core (all roles)
- 🔐 **JWT authentication** — register / login, hashed passwords (bcrypt), token-protected API
- 👤 **Role-based access control** — `student`, `teacher`, `admin` with enforced permissions
- 🔔 **Real-time notifications** — generated on submissions, grades, enrolments, announcements
- 📢 **Announcements** — broadcast to everyone, a role, or a specific course
- 🧑‍💼 **Profile management** — edit details + change password
- 🌗 **Light/Dark theme** toggle
- 🎬 **Recorded lectures** — teachers upload videos to **AWS S3**, students stream them in-app via signed URLs
- 🤖 **AI study assistant** — floating chatbot powered by **OpenAI** (gpt-4o-mini)
- 📱 **Responsive, modern UI** — Tailwind CSS + shadcn/ui with glassmorphism design

### 👨‍🎓 Student
- Personal dashboard: attendance %, grade average, badges, today's schedule
- Browse & **self-enrol** in courses
- View assignments and **submit / resubmit** work (auto late-detection)
- See grades & teacher feedback, **grade-trend line chart**
- 🎬 **Watch recorded lectures** for enrolled courses, streamed from S3
- 🤖 Ask the **AI study assistant** to explain concepts while studying
- 🏅 **Gamification** — badges for attendance, top scores and consistency

### 👩‍🏫 Teacher
- Create & manage **courses** and **assignments**
- **Upload recorded lectures** (videos stored on AWS S3) — enrolled students are notified
- **Mark attendance** (present / absent / late / excused) per class session
- **Grade submissions** with feedback (students are notified)
- Analytics: enrolment bar chart, pending-grading count, average performance

### 🛡️ Admin
- Platform analytics: role distribution **pie chart**, registrations-over-time **bar chart**
- **User management** table — change roles, suspend accounts, delete users
- Create users of any role, post platform-wide announcements

---

## 🛠️ Tech Stack

| Layer      | Technology |
|------------|-----------|
| Frontend   | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Router, React Query, Recharts |
| Backend    | Node.js, Express, Mongoose |
| Database   | MongoDB (Atlas or local) |
| Auth       | JWT (jsonwebtoken) + bcryptjs |
| Storage    | AWS S3 (recorded lecture videos, via AWS SDK v3 + multer) |
| AI         | OpenAI API (study-assistant chatbot) |

---

## 📁 Project Structure

```
EDUSPHERE/
├── backend/                  # Express REST API
│   ├── config/db.js          # MongoDB connection
│   ├── models/               # User, Course, Assignment, Submission,
│   │                         #   Attendance, Notification, Announcement
│   ├── middleware/           # auth (protect/authorize), error handling
│   ├── controllers/          # business logic per resource
│   ├── routes/               # REST route definitions
│   ├── utils/                # token, asyncHandler, notify, seed
│   └── server.js             # app entry point
│
└── src/                      # React frontend
    ├── services/             # api.ts (axios+JWT) + one service per resource
    ├── contexts/AuthContext  # JWT auth state
    ├── components/           # NotificationCenter, dialogs, chatbot, UI
    └── pages/                # Landing, Login, Register, dashboards, Courses, Profile
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- A MongoDB connection string (MongoDB Atlas free tier works great)

### 1. Backend

```bash
cd backend
cp .env.example .env        # then edit .env with your MONGO_URI + JWT_SECRET
npm install
npm run seed                # (optional) populate demo data
npm start                   # API runs on http://localhost:5000
```

### 2. Frontend

```bash
# from the project root
cp .env.example .env        # VITE_API_URL=http://localhost:5000
npm install
npm run dev                 # app runs on http://localhost:8080
```

Open **http://localhost:8080** and log in.

---

## 🔑 Demo Accounts

Run `npm run seed` (or POST `/api/seed`) to create demo data, then use the
**quick-login buttons** on the login page or sign in manually:

| Role    | Email                    | Password      |
|---------|--------------------------|---------------|
| Admin   | admin@edusphere.com      | `password123` |
| Teacher | teacher@edusphere.com    | `password123` |
| Student | student@edusphere.com    | `password123` |

The seed also creates extra teachers/students, 3 courses, 5 assignments,
sample submissions, attendance records and announcements.

---

## 📡 API Overview

Base URL: `http://localhost:5000/api` — all routes except `/auth/*` and `/seed`
require an `Authorization: Bearer <token>` header. See **[API_REFERENCE.md](./API_REFERENCE.md)**
for the full endpoint list, payloads and role requirements.

| Group           | Endpoints |
|-----------------|-----------|
| Auth            | `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `PUT /auth/profile`, `PUT /auth/password` |
| Users (admin)   | `GET/POST /users`, `GET/PUT/DELETE /users/:id` |
| Courses         | `GET/POST /courses`, `GET /courses/available`, `:id/enroll`, `:id/unenroll` |
| Assignments     | `GET/POST /assignments`, `GET/PUT/DELETE /assignments/:id` |
| Submissions     | `POST /submissions`, `GET /submissions/me`, `/pending`, `/assignment/:id`, `PUT /:id/grade` |
| Attendance      | `POST /attendance`, `GET /attendance/me`, `/course/:id`, `/student/:id` |
| Announcements   | `GET/POST /announcements`, `DELETE /:id` |
| Notifications   | `GET /notifications`, `PUT /:id/read`, `PUT /read-all`, `DELETE /:id` |
| Lectures        | `GET/POST /lectures` (multipart upload → S3), `GET/DELETE /lectures/:id` |
| AI Chat         | `POST /chat` (OpenAI study assistant) |
| Analytics       | `GET /analytics/{student,teacher,admin}` |
| Seed            | `POST /seed` |

---

## 🔒 Security Notes
- Passwords are hashed with **bcrypt**; hashes are never returned by the API.
- Protected routes verify a JWT and load the current user on every request.
- `authorize(...roles)` middleware enforces role permissions server-side.
- `.env` (with DB credentials) is git-ignored — use `.env.example` as the template.

---

## 📜 Available Scripts

**Frontend (root):** `npm run dev` · `npm run build` · `npm run preview` · `npm run lint`
**Backend (`/backend`):** `npm start` · `npm run dev` (watch) · `npm run seed`

---

Built as a college project demonstrating a production-style full-stack architecture. 🎓
