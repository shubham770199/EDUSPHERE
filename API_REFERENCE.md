# 📡 EduSphere API Reference

**Base URL:** `http://localhost:5000/api`

All responses are JSON. Errors return `{ "message": "..." }` with an appropriate HTTP status.

### Authentication
Send the JWT returned by login/register on every protected request:

```
Authorization: Bearer <token>
```

Roles: `student`, `teacher`, `admin`. Routes list the role(s) allowed.
"Auth" = any logged-in user. "Public" = no token needed.

---

## Auth — `/auth`

| Method | Path | Access | Body |
|--------|------|--------|------|
| POST | `/auth/register` | Public | `{ name, email, password, role?("student"\|"teacher"), department? }` → `{ token, user }` |
| POST | `/auth/login` | Public | `{ email, password }` → `{ token, user }` |
| GET  | `/auth/me` | Auth | → `{ user }` |
| PUT  | `/auth/profile` | Auth | `{ name?, department?, phone?, bio?, avatar?, rollNumber? }` → `{ user }` |
| PUT  | `/auth/password` | Auth | `{ currentPassword, newPassword }` |

> Self-registration only allows `student` or `teacher`. Admin accounts are created by an admin or via seed.

---

## Users — `/users`  *(admin only)*

| Method | Path | Body / Notes |
|--------|------|--------------|
| GET | `/users` | Query: `?role=&search=` |
| POST | `/users` | `{ name, email, password, role, department?, rollNumber?, phone? }` |
| GET | `/users/:id` | Single user |
| PUT | `/users/:id` | `{ name?, role?, status?, department?, rollNumber?, phone? }` |
| DELETE | `/users/:id` | Cannot delete yourself |

---

## Courses — `/courses`

| Method | Path | Access | Notes |
|--------|------|--------|-------|
| GET | `/courses` | Auth | Role-aware: admin=all, teacher=own, student=enrolled |
| GET | `/courses/available` | Auth | Courses the student is **not** enrolled in |
| POST | `/courses` | teacher/admin | `{ title, code, description?, department?, credits?, semester?, schedule?, color? }` |
| GET | `/courses/:id` | Auth | |
| PUT | `/courses/:id` | owner/admin | Same fields as create |
| DELETE | `/courses/:id` | owner/admin | |
| POST | `/courses/:id/enroll` | Auth | Student self-enrols; teacher/admin pass `{ studentId }` |
| POST | `/courses/:id/unenroll` | Auth | |

---

## Assignments — `/assignments`

| Method | Path | Access | Notes |
|--------|------|--------|-------|
| GET | `/assignments` | Auth | Student: enrolled-course assignments + `submissionStatus`. Teacher: own + submission counts |
| POST | `/assignments` | teacher/admin | `{ title, description?, course, dueDate, maxMarks? }` — notifies enrolled students |
| GET | `/assignments/:id` | Auth | |
| PUT | `/assignments/:id` | owner/admin | |
| DELETE | `/assignments/:id` | owner/admin | Also deletes its submissions |

---

## Submissions — `/submissions`

| Method | Path | Access | Notes |
|--------|------|--------|-------|
| POST | `/submissions` | student | `{ assignmentId, content?, attachments? }` — upsert; auto `late` after due date |
| GET | `/submissions/me` | student | Your submissions |
| GET | `/submissions/pending` | teacher/admin | Ungraded submissions across your assignments |
| GET | `/submissions/assignment/:assignmentId` | teacher/admin | All submissions for an assignment |
| PUT | `/submissions/:id/grade` | teacher/admin | `{ grade, feedback? }` — notifies the student |

---

## Attendance — `/attendance`

| Method | Path | Access | Notes |
|--------|------|--------|-------|
| POST | `/attendance` | teacher/admin | `{ courseId, date, records:[{ student, status, remarks? }] }` (bulk upsert) |
| GET | `/attendance/me` | student | `{ overall, courses[], records[] }` with computed `%` |
| GET | `/attendance/course/:courseId` | teacher/admin | Query: `?date=` |
| GET | `/attendance/student/:studentId` | teacher/admin | `{ stats, records }` |

`status` ∈ `present` · `absent` · `late` · `excused`. Percentage = `(present + late) / (total − excused)`.

---

## Announcements — `/announcements`

| Method | Path | Access | Notes |
|--------|------|--------|-------|
| GET | `/announcements` | Auth | Role-aware feed |
| POST | `/announcements` | teacher/admin | `{ title, message, audience?("all"\|"students"\|"teachers"\|"course"), course?, priority? }` — fans out notifications |
| DELETE | `/announcements/:id` | author/admin | |

---

## Notifications — `/notifications`

| Method | Path | Access | Notes |
|--------|------|--------|-------|
| GET | `/notifications` | Auth | `{ notifications[], unread }` |
| PUT | `/notifications/:id/read` | Auth | |
| PUT | `/notifications/read-all` | Auth | |
| DELETE | `/notifications/:id` | Auth | |

---

## Lectures — `/lectures`  (recorded video, stored on AWS S3)

| Method | Path | Access | Notes |
|--------|------|--------|-------|
| GET | `/lectures` | Auth | Role-aware list. Each item includes a temporary signed `videoUrl` |
| POST | `/lectures` | teacher/admin | **multipart/form-data**: `video` (file) + `title`, `course`, `description?`. Max 500 MB. Notifies enrolled students |
| GET | `/lectures/:id` | Auth | Single lecture + fresh signed `videoUrl` (students must be enrolled; increments `views`) |
| DELETE | `/lectures/:id` | owner/admin | Deletes the DB record and the S3 object |

Videos are stored privately in S3 and served via short-lived **pre-signed URLs**
(generated per request), so the bucket never needs to be public.

---

## AI Study Assistant — `/chat`

| Method | Path | Access | Body |
|--------|------|--------|------|
| POST | `/chat` | Auth | `{ message, history?: [{ role:"user"\|"assistant", content }] }` → `{ reply }` |

Backed by the OpenAI Chat Completions API (`OPENAI_MODEL`, default `gpt-4o-mini`).
The API key stays server-side and is never exposed to the browser. History is
capped to the last 10 turns to bound token usage.

---

## Analytics — `/analytics`

| Method | Path | Access | Returns |
|--------|------|--------|---------|
| GET | `/analytics/student` | student | attendance %, grade average + letter, badges, grade trend, counts |
| GET | `/analytics/teacher` | teacher/admin | course/student counts, pending grading, avg performance, enrolment chart data |
| GET | `/analytics/admin` | admin | role counts + breakdown, recent users, course stats, monthly registrations |

---

## Utility

| Method | Path | Access | Notes |
|--------|------|--------|-------|
| GET | `/health` | Public | `{ ok, time }` |
| POST | `/seed` | Public | Resets DB with demo data (returns demo credentials) |

---

### Example: login then call a protected route

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"student@edusphere.com","password":"password123"}' | jq -r .token)

# 2. Use the token
curl http://localhost:5000/api/analytics/student \
  -H "Authorization: Bearer $TOKEN"
```
