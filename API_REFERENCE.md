# 📖 EduSphere Services API Reference

## Overview
This document provides a complete API reference for all EduSphere services. All services are in `src/services/`.

---

## 1. Attendance Service
**File**: `src/services/attendanceService.ts`

### Methods

#### `markAttendance()`
Marks attendance for a single student.

```typescript
markAttendance(
  studentId: string,
  studentName: string,
  courseId: string,
  courseName: string,
  status: 'present' | 'absent' | 'late' | 'excused',
  remarks?: string
): AttendanceRecord
```

**Example**:
```typescript
attendanceService.markAttendance(
  'student1',
  'John Doe',
  '1',
  'Mathematics 101',
  'present',
  'Participated well'
)
```

#### `markClassAttendance()`
Bulk marks attendance for entire class in one action.

```typescript
markClassAttendance(
  courseId: string,
  courseName: string,
  attendanceData: Array<{
    studentId: string,
    studentName: string,
    status: string,
    remarks?: string
  }>
): AttendanceRecord[]
```

#### `getAttendanceStats()`
Gets attendance statistics for a student.

```typescript
getAttendanceStats(
  studentId: string,
  courseId?: string
): AttendanceStats {
  totalClasses: number,
  present: number,
  absent: number,
  late: number,
  excused: number,
  percentage: number
}
```

#### `getCourseAttendance()`
Gets all attendance records for a course.

```typescript
getCourseAttendance(courseId: string): AttendanceRecord[]
```

#### `getTodaysAttendance()`
Gets today's attendance for a course.

```typescript
getTodaysAttendance(courseId: string): AttendanceRecord[]
```

---

## 2. Assignment Service
**File**: `src/services/assignmentService.ts`

### Methods

#### `createAssignment()`
Creates a new assignment.

```typescript
createAssignment(
  courseId: string,
  courseName: string,
  teacherId: string,
  title: string,
  description: string,
  dueDate: string, // 'YYYY-MM-DD'
  maxMarks?: number,
  attachments?: string[]
): Assignment
```

**Example**:
```typescript
assignmentService.createAssignment(
  '1',
  'Mathematics 101',
  'teacher1',
  'Calculus Problem Set',
  'Solve problems 1-10 from Chapter 5',
  '2024-01-25',
  100,
  ['problem_set.pdf']
)
```

#### `submitAssignment()`
Submits an assignment.

```typescript
submitAssignment(
  assignmentId: string,
  studentId: string,
  studentName: string,
  attachments: string[]
): AssignmentSubmission
```

#### `getAssignmentSubmissions()`
Gets all submissions for an assignment.

```typescript
getAssignmentSubmissions(assignmentId: string): AssignmentSubmission[]
```

#### `getStudentSubmission()`
Gets specific student's submission for an assignment.

```typescript
getStudentSubmission(
  assignmentId: string,
  studentId: string
): AssignmentSubmission | undefined
```

#### `gradeSubmission()`
Grades a student submission.

```typescript
gradeSubmission(
  submissionId: string,
  grade: number,
  feedback?: string
): AssignmentSubmission
```

**Example**:
```typescript
assignmentService.gradeSubmission(
  'sub_123456',
  95,
  'Excellent work! Very thorough analysis.'
)
```

#### `getPendingSubmissions()`
Gets all ungraded submissions for a teacher.

```typescript
getPendingSubmissions(teacherId: string): AssignmentSubmission[]
```

---

## 3. Notification Service
**File**: `src/services/notificationService.ts`

### Methods

#### `createNotification()`
Creates a new notification.

```typescript
createNotification(
  userId: string,
  title: string,
  message: string,
  type?: 'info' | 'success' | 'warning' | 'error' | 'assignment' | 'attendance' | 'grade',
  relatedId?: string
): Notification
```

**Example**:
```typescript
notificationService.createNotification(
  'student1',
  'New Assignment',
  'Your teacher posted a new assignment',
  'assignment',
  'assign_123'
)
```

#### `getUserNotifications()`
Gets all notifications for a user.

```typescript
getUserNotifications(
  userId: string,
  unreadOnly?: boolean
): Notification[]
```

#### `markAsRead()`
Marks a notification as read.

```typescript
markAsRead(notificationId: string): Notification | undefined
```

#### `markAllAsRead()`
Marks all notifications as read for a user.

```typescript
markAllAsRead(userId: string): void
```

#### `getUnreadCount()`
Gets count of unread notifications.

```typescript
getUnreadCount(userId: string): number
```

#### `deleteNotification()`
Deletes a notification.

```typescript
deleteNotification(notificationId: string): boolean
```

#### `broadcastNotification()`
Sends notification to all users (or all except specified users).

```typescript
broadcastNotification(
  title: string,
  message: string,
  type?: string,
  excludeUsers?: string[]
): Notification[]
```

---

## 4. Chatbot Service
**File**: `src/services/chatbotService.ts`

### Methods

#### `createSession()`
Creates a new chat session for a user.

```typescript
createSession(userId: string): ChatSession
```

#### `getOrCreateSession()`
Gets existing session or creates new one.

```typescript
getOrCreateSession(userId: string): ChatSession
```

#### `sendMessage()`
Sends a message and gets bot response (async).

```typescript
async sendMessage(
  sessionId: string,
  userMessage: string
): Promise<{
  userMessage: ChatMessage,
  botResponse: ChatMessage
}>
```

**Example**:
```typescript
const { userMessage, botResponse } = await chatbotService.sendMessage(
  'session_123',
  'How do I submit an assignment?'
)
```

#### `generateResponse()`
Generates bot response based on user message.

```typescript
generateResponse(
  userMessage: string,
  userId: string
): string
```

#### `getChatHistory()`
Gets all messages in a session.

```typescript
getChatHistory(sessionId: string): ChatMessage[]
```

#### `clearHistory()`
Clears chat history for a session.

```typescript
clearHistory(sessionId: string): void
```

#### `searchKnowledge()`
Searches the chatbot's knowledge base.

```typescript
searchKnowledge(query: string): string[]
```

---

## Data Types

### AttendanceRecord
```typescript
interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  date: string; // YYYY-MM-DD
  status: 'present' | 'absent' | 'late' | 'excused';
  remarks?: string;
}
```

### AttendanceStats
```typescript
interface AttendanceStats {
  totalClasses: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  percentage: number;
}
```

### Assignment
```typescript
interface Assignment {
  id: string;
  courseId: string;
  courseName: string;
  teacherId: string;
  title: string;
  description: string;
  dueDate: string; // YYYY-MM-DD
  createdDate: string; // YYYY-MM-DD
  maxMarks: number;
  attachments: string[];
}
```

### AssignmentSubmission
```typescript
interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  submissionDate: string; // YYYY-MM-DD
  attachments: string[];
  submittedStatus: 'submitted' | 'pending' | 'late';
  grade?: number;
  feedback?: string;
  gradedDate?: string; // YYYY-MM-DD
}
```

### Notification
```typescript
interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'assignment' | 'attendance' | 'grade';
  createdAt: string; // ISO string
  read: boolean;
  relatedId?: string;
}
```

### ChatMessage
```typescript
interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  message: string;
  timestamp: string; // ISO string
  attachments?: string[];
}
```

### ChatSession
```typescript
interface ChatSession {
  id: string;
  userId: string;
  messages: ChatMessage[];
  startedAt: string; // ISO string
  lastActivityAt: string; // ISO string
}
```

---

## Usage Examples

### Example 1: Mark Class Attendance
```typescript
import { attendanceService } from '@/services/attendanceService';

const records = attendanceService.markClassAttendance(
  '1', // courseId
  'Mathematics 101', // courseName
  [
    { studentId: 'student1', studentName: 'Alice', status: 'present' },
    { studentId: 'student2', studentName: 'Bob', status: 'absent', remarks: 'Sick' },
    { studentId: 'student3', studentName: 'Carol', status: 'late' }
  ]
);

console.log(`Marked attendance for ${records.length} students`);
```

### Example 2: Create and Submit Assignment
```typescript
import { assignmentService } from '@/services/assignmentService';

// Teacher creates assignment
const assignment = assignmentService.createAssignment(
  '1',
  'Mathematics 101',
  'teacher1',
  'Problem Set 1',
  'Solve all problems in section 5',
  '2024-01-25',
  100,
  ['ps1.pdf']
);

// Student submits
const submission = assignmentService.submitAssignment(
  assignment.id,
  'student1',
  'John Doe',
  ['solution.pdf']
);

// Teacher grades
const graded = assignmentService.gradeSubmission(
  submission.id,
  95,
  'Well done!'
);
```

### Example 3: Send Notifications
```typescript
import { notificationService } from '@/services/notificationService';

// Send to specific user
notificationService.createNotification(
  'student1',
  'Assignment Graded',
  'Your assignment has been graded. Check your feedback.',
  'grade',
  'assign_123'
);

// Broadcast to all
notificationService.broadcastNotification(
  'System Update',
  'Platform will be under maintenance tomorrow at 2 AM',
  'info'
);
```

### Example 4: Use Chatbot
```typescript
import { chatbotService } from '@/services/chatbotService';

// Get or create session
const session = chatbotService.getOrCreateSession('student1');

// Send message and get response
const { userMessage, botResponse } = await chatbotService.sendMessage(
  session.id,
  'How do I submit an assignment?'
);

console.log('User:', userMessage.message);
console.log('Bot:', botResponse.message);

// Get full chat history
const history = chatbotService.getChatHistory(session.id);
```

---

## Storage & Persistence

All services use **localStorage** for data persistence:
- `edu_sphere_attendance_records` - Attendance data
- `edu_sphere_courses` - Course data
- `edu_sphere_assignments` - Assignment data
- `edu_sphere_submissions` - Submission data
- `edu_sphere_notifications` - Notification data
- `edu_sphere_chat_sessions` - Chat history

**Note**: This is for demo. In production, use a real backend API.

---

## Real-Time Features

### Real-Time Notifications
- Attendance marking → instant student notification
- Assignment creation → instant student notification
- Grade submission → instant student notification

### Real-Time Chat
- Messages appear instantly (300ms delay for natural feel)
- Complete chat history maintained per session

### Real-Time Updates
- Student dashboard updates when grades are posted
- Attendance stats update immediately
- New assignments appear instantly

---

## Error Handling

All services include error handling:
```typescript
try {
  const result = assignmentService.submitAssignment(...);
} catch (error) {
  console.error('Submission failed:', error.message);
  // Show user-friendly error message
}
```

---

## Performance Considerations

- LocalStorage queries are instant
- Chat responses have 300ms artificial delay for better UX
- Bulk operations (mark class attendance) are optimized
- Notification queries are filtered efficiently

---

## Version
- **Current**: 1.0.0
- **Last Updated**: January 16, 2026
- **Status**: Production Ready

---

**For questions or issues, refer to the QUICK_START.md or FEATURES_IMPLEMENTED.md files.**
