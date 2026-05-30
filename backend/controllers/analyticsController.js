const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Attendance = require('../models/Attendance');
const { computeStats } = require('./attendanceController');

// @route GET /api/analytics/admin  (admin)
exports.adminAnalytics = asyncHandler(async (req, res) => {
  const [students, teachers, admins, courses, assignments, submissions] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'teacher' }),
    User.countDocuments({ role: 'admin' }),
    Course.countDocuments(),
    Assignment.countDocuments(),
    Submission.countDocuments(),
  ]);

  const recentUsers = await User.find().sort({ createdAt: -1 }).limit(6);

  // Enrollment per course (top 6)
  const courseDocs = await Course.find().populate('teacher', 'name').sort({ createdAt: -1 });
  const courseStats = courseDocs.slice(0, 6).map((c) => ({
    id: c._id,
    name: c.title,
    code: c.code,
    department: c.department,
    teacher: c.teacher ? c.teacher.name : '—',
    students: c.students.length,
  }));

  // Users registered per month (last 6 months) for a chart
  const monthly = await User.aggregate([
    {
      $group: {
        _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.y': 1, '_id.m': 1 } },
    { $limit: 12 },
  ]);

  res.json({
    counts: { students, teachers, admins, courses, assignments, submissions, users: students + teachers + admins },
    roleBreakdown: [
      { name: 'Students', value: students },
      { name: 'Teachers', value: teachers },
      { name: 'Admins', value: admins },
    ],
    recentUsers: recentUsers.map((u) => ({
      id: u._id,
      name: u.name,
      role: u.role,
      status: u.status,
      department: u.department,
      joinDate: u.createdAt,
    })),
    courseStats,
    monthly: monthly.map((m) => ({
      month: `${m._id.y}-${String(m._id.m).padStart(2, '0')}`,
      users: m.count,
    })),
  });
});

// @route GET /api/analytics/teacher  (teacher)
exports.teacherAnalytics = asyncHandler(async (req, res) => {
  const courses = await Course.find({ teacher: req.user._id });
  const courseIds = courses.map((c) => c._id);
  const totalStudents = new Set(courses.flatMap((c) => c.students.map(String))).size;

  const assignments = await Assignment.find({ teacher: req.user._id }).select('_id title maxMarks');
  const assignmentIds = assignments.map((a) => a._id);

  const [pendingCount, gradedSubs] = await Promise.all([
    Submission.countDocuments({ assignment: { $in: assignmentIds }, status: { $ne: 'graded' } }),
    Submission.find({ assignment: { $in: assignmentIds }, status: 'graded' }).populate('assignment', 'maxMarks title'),
  ]);

  // Average class performance (% of max marks across graded submissions)
  let avgPerformance = 0;
  if (gradedSubs.length) {
    const pct = gradedSubs.map((s) => (s.grade / (s.assignment?.maxMarks || 100)) * 100);
    avgPerformance = Math.round(pct.reduce((a, b) => a + b, 0) / pct.length);
  }

  // Per-course enrollment for a chart
  const coursePerformance = courses.map((c) => ({
    name: c.code || c.title,
    students: c.students.length,
  }));

  res.json({
    counts: {
      courses: courses.length,
      students: totalStudents,
      assignments: assignments.length,
      pendingGrading: pendingCount,
    },
    avgPerformance,
    coursePerformance,
  });
});

// @route GET /api/analytics/student  (student)
exports.studentAnalytics = asyncHandler(async (req, res) => {
  const courses = await Course.find({ students: req.user._id }).select('_id');
  const courseIds = courses.map((c) => c._id);

  const assignments = await Assignment.find({ course: { $in: courseIds } }).select('_id maxMarks');
  const assignmentIds = assignments.map((a) => a._id);

  const submissions = await Submission.find({ student: req.user._id }).populate('assignment', 'maxMarks title');
  const graded = submissions.filter((s) => s.status === 'graded');

  // Attendance %
  const attendance = await Attendance.find({ student: req.user._id });
  const attStats = computeStats(attendance);

  // Overall grade (avg % across graded assignments)
  let gradeAvg = 0;
  if (graded.length) {
    const pct = graded.map((s) => (s.grade / (s.assignment?.maxMarks || 100)) * 100);
    gradeAvg = Math.round(pct.reduce((a, b) => a + b, 0) / pct.length);
  }
  const overallGrade =
    gradeAvg >= 90 ? 'A' : gradeAvg >= 80 ? 'B+' : gradeAvg >= 70 ? 'B' : gradeAvg >= 60 ? 'C' : gradeAvg > 0 ? 'D' : 'N/A';

  // Badges (simple gamification)
  const badges = [];
  if (attStats.percentage >= 90) badges.push('Perfect Attendance');
  if (gradeAvg >= 85) badges.push('Top Scorer');
  if (submissions.length >= 3) badges.push('Consistent Submitter');
  if (graded.some((s) => (s.grade / (s.assignment?.maxMarks || 100)) >= 0.95)) badges.push('Excellence');

  // Grade trend for chart
  const gradeTrend = graded
    .slice(-8)
    .map((s) => ({
      name: s.assignment?.title?.slice(0, 12) || 'Item',
      score: Math.round((s.grade / (s.assignment?.maxMarks || 100)) * 100),
    }));

  res.json({
    attendancePercentage: attStats.percentage,
    attendanceStats: attStats,
    overallGrade,
    gradeAverage: gradeAvg,
    badgesEarned: badges.length,
    badges,
    counts: {
      courses: courseIds.length,
      assignments: assignmentIds.length,
      submitted: submissions.length,
      graded: graded.length,
    },
    gradeTrend,
  });
});
