const asyncHandler = require('../utils/asyncHandler');
const Assignment = require('../models/Assignment');
const Course = require('../models/Course');
const Submission = require('../models/Submission');
const { notifyUsers } = require('../utils/notify');

// @route GET /api/assignments  — role-aware
// student: assignments from enrolled courses + their submission status
// teacher: assignments they created
// admin:   all
exports.getAssignments = asyncHandler(async (req, res) => {
  if (req.user.role === 'student') {
    const courses = await Course.find({ students: req.user._id }).select('_id');
    const courseIds = courses.map((c) => c._id);
    const assignments = await Assignment.find({ course: { $in: courseIds } })
      .populate('course', 'title code color')
      .populate('teacher', 'name')
      .sort({ dueDate: 1 });

    const subs = await Submission.find({ student: req.user._id });
    const subMap = new Map(subs.map((s) => [String(s.assignment), s]));

    const withStatus = assignments.map((a) => {
      const sub = subMap.get(String(a._id));
      return {
        ...a.toObject(),
        submissionStatus: sub ? sub.status : 'pending',
        grade: sub ? sub.grade : null,
        submissionId: sub ? sub._id : null,
      };
    });
    return res.json(withStatus);
  }

  const filter = req.user.role === 'teacher' ? { teacher: req.user._id } : {};
  const assignments = await Assignment.find(filter)
    .populate('course', 'title code color')
    .populate('teacher', 'name')
    .sort({ createdAt: -1 });

  // attach submission counts for teachers/admin
  const withCounts = await Promise.all(
    assignments.map(async (a) => {
      const total = await Submission.countDocuments({ assignment: a._id });
      const graded = await Submission.countDocuments({ assignment: a._id, status: 'graded' });
      return { ...a.toObject(), submissionCount: total, gradedCount: graded };
    })
  );
  res.json(withCounts);
});

// @route GET /api/assignments/:id
exports.getAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id)
    .populate('course', 'title code')
    .populate('teacher', 'name');
  if (!assignment) {
    res.status(404);
    throw new Error('Assignment not found');
  }
  res.json(assignment);
});

// @route POST /api/assignments  (teacher/admin)
exports.createAssignment = asyncHandler(async (req, res) => {
  const { title, description, course, dueDate, maxMarks, attachments } = req.body;
  if (!title || !course || !dueDate) {
    res.status(400);
    throw new Error('Title, course and due date are required');
  }

  const courseDoc = await Course.findById(course);
  if (!courseDoc) {
    res.status(404);
    throw new Error('Course not found');
  }
  if (req.user.role !== 'admin' && !courseDoc.teacher.equals(req.user._id)) {
    res.status(403);
    throw new Error('You can only add assignments to your own courses');
  }

  const assignment = await Assignment.create({
    title,
    description,
    course,
    teacher: req.user._id,
    dueDate,
    maxMarks: maxMarks || 100,
    attachments: attachments || [],
  });

  // Notify enrolled students
  if (courseDoc.students.length) {
    await notifyUsers(courseDoc.students, {
      title: 'New assignment posted 📝',
      message: `${title} — due ${new Date(dueDate).toLocaleDateString()} in ${courseDoc.title}.`,
      type: 'assignment',
    });
  }

  res.status(201).json(assignment);
});

// @route PUT /api/assignments/:id
exports.updateAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) {
    res.status(404);
    throw new Error('Assignment not found');
  }
  if (req.user.role !== 'admin' && !assignment.teacher.equals(req.user._id)) {
    res.status(403);
    throw new Error('Not authorized to edit this assignment');
  }
  ['title', 'description', 'dueDate', 'maxMarks', 'attachments'].forEach((f) => {
    if (req.body[f] !== undefined) assignment[f] = req.body[f];
  });
  await assignment.save();
  res.json(assignment);
});

// @route DELETE /api/assignments/:id
exports.deleteAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) {
    res.status(404);
    throw new Error('Assignment not found');
  }
  if (req.user.role !== 'admin' && !assignment.teacher.equals(req.user._id)) {
    res.status(403);
    throw new Error('Not authorized to delete this assignment');
  }
  await Submission.deleteMany({ assignment: assignment._id });
  await assignment.deleteOne();
  res.json({ message: 'Assignment deleted' });
});
