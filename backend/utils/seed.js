/**
 * Seed the database with realistic demo data for the EduSphere project.
 * Can be run standalone with `npm run seed` or invoked from the /api/seed route.
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

const User = require('../models/User');
const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Attendance = require('../models/Attendance');
const Notification = require('../models/Notification');
const Announcement = require('../models/Announcement');

const daysFromNow = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
};
const dateStr = (n) => daysFromNow(n).toISOString().split('T')[0];

async function seedDatabase() {
  // Wipe everything for a clean, repeatable demo.
  await Promise.all([
    User.deleteMany({}),
    Course.deleteMany({}),
    Assignment.deleteMany({}),
    Submission.deleteMany({}),
    Attendance.deleteMany({}),
    Notification.deleteMany({}),
    Announcement.deleteMany({}),
  ]);

  // --- Users (password is the same for all demo accounts) ---
  // NOTE: create() runs the pre-save hook so passwords get hashed.
  const admin = await User.create({
    name: 'Alice Admin', email: 'admin@edusphere.com', password: 'password123',
    role: 'admin', department: 'Administration',
  });

  const teachers = await User.create([
    { name: 'Dr. Sarah Smith', email: 'teacher@edusphere.com', password: 'password123', role: 'teacher', department: 'Computer Science' },
    { name: 'Prof. John Johnson', email: 'john@edusphere.com', password: 'password123', role: 'teacher', department: 'Physics' },
  ]);

  const students = await User.create([
    { name: 'Bob Student', email: 'student@edusphere.com', password: 'password123', role: 'student', department: 'Computer Science', rollNumber: 'CS2026001' },
    { name: 'Emma Wilson', email: 'emma@edusphere.com', password: 'password123', role: 'student', department: 'Computer Science', rollNumber: 'CS2026002' },
    { name: 'Liam Brown', email: 'liam@edusphere.com', password: 'password123', role: 'student', department: 'Physics', rollNumber: 'PH2026003' },
    { name: 'Olivia Davis', email: 'olivia@edusphere.com', password: 'password123', role: 'student', department: 'Computer Science', rollNumber: 'CS2026004' },
    { name: 'Noah Miller', email: 'noah@edusphere.com', password: 'password123', role: 'student', department: 'Physics', rollNumber: 'PH2026005' },
  ]);

  const studentIds = students.map((s) => s._id);

  // --- Courses ---
  const courses = await Course.create([
    {
      title: 'Data Structures & Algorithms', code: 'CS301', department: 'Computer Science',
      description: 'Core data structures, algorithm design and complexity analysis.',
      credits: 4, semester: 'Fall 2026', teacher: teachers[0]._id, color: '#6366f1',
      students: studentIds.slice(0, 4),
      schedule: [{ day: 'Monday', time: '09:00 AM', room: 'Room 301' }, { day: 'Wednesday', time: '09:00 AM', room: 'Room 301' }],
    },
    {
      title: 'Web Development', code: 'CS340', department: 'Computer Science',
      description: 'Full-stack web development with the MERN stack.',
      credits: 3, semester: 'Fall 2026', teacher: teachers[0]._id, color: '#ec4899',
      students: [studentIds[0], studentIds[1], studentIds[3]],
      schedule: [{ day: 'Tuesday', time: '02:00 PM', room: 'Lab 2' }, { day: 'Thursday', time: '02:00 PM', room: 'Lab 2' }],
    },
    {
      title: 'Classical Mechanics', code: 'PH201', department: 'Physics',
      description: "Newtonian mechanics, energy, momentum and rotational dynamics.",
      credits: 4, semester: 'Fall 2026', teacher: teachers[1]._id, color: '#14b8a6',
      students: [studentIds[2], studentIds[4], studentIds[0]],
      schedule: [{ day: 'Monday', time: '11:00 AM', room: 'Room 205' }, { day: 'Friday', time: '11:00 AM', room: 'Room 205' }],
    },
  ]);

  // Sync enrolledCourses on each student
  for (const course of courses) {
    await User.updateMany({ _id: { $in: course.students } }, { $addToSet: { enrolledCourses: course._id } });
  }

  // --- Assignments ---
  const assignments = await Assignment.create([
    { title: 'Binary Tree Implementation', description: 'Implement a balanced BST with insert, delete and traversal.', course: courses[0]._id, teacher: teachers[0]._id, dueDate: daysFromNow(5), maxMarks: 100 },
    { title: 'Sorting Algorithms Report', description: 'Compare time complexity of 5 sorting algorithms with benchmarks.', course: courses[0]._id, teacher: teachers[0]._id, dueDate: daysFromNow(-2), maxMarks: 50 },
    { title: 'Build a REST API', description: 'Create a CRUD REST API using Express and MongoDB.', course: courses[1]._id, teacher: teachers[0]._id, dueDate: daysFromNow(8), maxMarks: 100 },
    { title: 'React Portfolio Site', description: 'Build a responsive portfolio with React and Tailwind.', course: courses[1]._id, teacher: teachers[0]._id, dueDate: daysFromNow(12), maxMarks: 100 },
    { title: 'Projectile Motion Lab', description: 'Lab report analysing projectile trajectories.', course: courses[2]._id, teacher: teachers[1]._id, dueDate: daysFromNow(3), maxMarks: 50 },
  ]);

  // --- Submissions (a few, including one graded) ---
  const subs = await Submission.create([
    { assignment: assignments[1]._id, student: studentIds[0], content: 'Report attached comparing bubble, merge, quick, heap and insertion sort.', status: 'graded', grade: 45, feedback: 'Great analysis. Add Big-O for best/worst cases next time.', gradedAt: new Date(), gradedBy: teachers[0]._id },
    { assignment: assignments[1]._id, student: studentIds[1], content: 'My sorting comparison report.', status: 'submitted' },
    { assignment: assignments[0]._id, student: studentIds[0], content: 'BST implementation in C++.', status: 'submitted' },
    { assignment: assignments[4]._id, student: studentIds[2], content: 'Projectile motion lab results.', status: 'graded', grade: 48, feedback: 'Excellent data collection and error analysis.', gradedAt: new Date(), gradedBy: teachers[1]._id },
  ]);

  // --- Attendance (last 5 sessions for CS301) ---
  const attendanceOps = [];
  const cs301Students = courses[0].students;
  for (let d = 1; d <= 5; d++) {
    cs301Students.forEach((sid, i) => {
      // Vary status a little so stats look realistic
      let status = 'present';
      if (d === 2 && i === 1) status = 'absent';
      if (d === 4 && i === 2) status = 'late';
      if (d === 3 && i === 3) status = 'excused';
      attendanceOps.push({
        student: sid, course: courses[0]._id, date: dateStr(-d), status, markedBy: teachers[0]._id,
      });
    });
  }
  await Attendance.insertMany(attendanceOps);

  // --- Announcements ---
  await Announcement.create([
    { title: 'Welcome to Fall 2026 Semester', message: 'Classes begin this week. Check your dashboard for schedules and assignments.', author: admin._id, audience: 'all', priority: 'high' },
    { title: 'Library Extended Hours', message: 'The library will be open until midnight during exam week.', author: admin._id, audience: 'students', priority: 'normal' },
    { title: 'CS301 Extra Tutorial', message: 'Optional tutorial on tree balancing this Friday at 3 PM in Room 301.', author: teachers[0]._id, audience: 'course', course: courses[0]._id, priority: 'normal' },
  ]);

  // --- A couple of starter notifications for the demo student ---
  await Notification.create([
    { user: studentIds[0], title: 'Welcome to EduSphere! 🎓', message: 'Your student account is ready. Explore your dashboard.', type: 'success' },
    { user: studentIds[0], title: 'Assignment graded ⭐', message: 'Your Sorting Algorithms Report scored 45/50.', type: 'grade' },
  ]);

  return {
    users: { admin: 1, teachers: teachers.length, students: students.length },
    courses: courses.length,
    assignments: assignments.length,
    submissions: subs.length,
    attendanceRecords: attendanceOps.length,
    demoCredentials: {
      admin: 'admin@edusphere.com / password123',
      teacher: 'teacher@edusphere.com / password123',
      student: 'student@edusphere.com / password123',
    },
  };
}

module.exports = seedDatabase;

// Allow running directly: `node utils/seed.js`
if (require.main === module) {
  (async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('🌱 Seeding database...');
      const result = await seedDatabase();
      console.log('✅ Seed complete:', JSON.stringify(result, null, 2));
      await mongoose.disconnect();
      process.exit(0);
    } catch (err) {
      console.error('❌ Seed failed:', err);
      process.exit(1);
    }
  })();
}
