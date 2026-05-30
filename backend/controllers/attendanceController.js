const asyncHandler = require('../utils/asyncHandler');
const Attendance = require('../models/Attendance');
const Course = require('../models/Course');

const computeStats = (records) => {
  const total = records.length;
  const present = records.filter((r) => r.status === 'present').length;
  const late = records.filter((r) => r.status === 'late').length;
  const absent = records.filter((r) => r.status === 'absent').length;
  const excused = records.filter((r) => r.status === 'excused').length;
  // Excused classes are not counted against the student.
  const effectiveTotal = total - excused;
  const percentage = effectiveTotal > 0 ? Math.round(((present + late) / effectiveTotal) * 100) : 100;
  return { total, present, late, absent, excused, percentage };
};

// @route POST /api/attendance  (teacher/admin) — bulk mark a class for a date
// body: { courseId, date, records: [{ student, status, remarks }] }
exports.markAttendance = asyncHandler(async (req, res) => {
  const { courseId, date, records } = req.body;
  if (!courseId || !date || !Array.isArray(records)) {
    res.status(400);
    throw new Error('courseId, date and records[] are required');
  }
  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  if (req.user.role !== 'admin' && !course.teacher.equals(req.user._id)) {
    res.status(403);
    throw new Error('You can only mark attendance for your own courses');
  }

  // Upsert each record (student + course + date is unique).
  const ops = records.map((r) => ({
    updateOne: {
      filter: { student: r.student, course: courseId, date },
      update: {
        $set: {
          status: r.status || 'present',
          remarks: r.remarks || '',
          markedBy: req.user._id,
        },
      },
      upsert: true,
    },
  }));
  if (ops.length) await Attendance.bulkWrite(ops);

  const saved = await Attendance.find({ course: courseId, date }).populate('student', 'name rollNumber');
  res.status(201).json(saved);
});

// @route GET /api/attendance/course/:courseId?date=  (teacher/admin)
exports.getCourseAttendance = asyncHandler(async (req, res) => {
  const filter = { course: req.params.courseId };
  if (req.query.date) filter.date = req.query.date;
  const records = await Attendance.find(filter)
    .populate('student', 'name rollNumber email')
    .sort({ date: -1 });
  res.json(records);
});

// @route GET /api/attendance/me  (student) — records + stats, grouped by course
exports.getMyAttendance = asyncHandler(async (req, res) => {
  const records = await Attendance.find({ student: req.user._id })
    .populate('course', 'title code')
    .sort({ date: -1 });

  const overall = computeStats(records);

  // Per-course breakdown
  const byCourse = {};
  records.forEach((r) => {
    const key = r.course ? String(r.course._id) : 'unknown';
    if (!byCourse[key]) {
      byCourse[key] = { course: r.course, records: [] };
    }
    byCourse[key].records.push(r);
  });
  const courses = Object.values(byCourse).map((c) => ({
    course: c.course,
    ...computeStats(c.records),
  }));

  res.json({ overall, courses, records });
});

// @route GET /api/attendance/student/:studentId  (teacher/admin)
exports.getStudentAttendance = asyncHandler(async (req, res) => {
  const records = await Attendance.find({ student: req.params.studentId })
    .populate('course', 'title code')
    .sort({ date: -1 });
  res.json({ stats: computeStats(records), records });
});

exports.computeStats = computeStats;
