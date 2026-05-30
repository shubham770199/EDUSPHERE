const asyncHandler = require('../utils/asyncHandler');
const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const { notifyUser } = require('../utils/notify');

// @route POST /api/submissions  (student) — create or update own submission
exports.submit = asyncHandler(async (req, res) => {
  const { assignmentId, content, attachments } = req.body;
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    res.status(404);
    throw new Error('Assignment not found');
  }

  const isLate = new Date() > new Date(assignment.dueDate);
  const status = isLate ? 'late' : 'submitted';

  // Upsert: a student has at most one submission per assignment.
  let submission = await Submission.findOne({ assignment: assignmentId, student: req.user._id });
  if (submission) {
    if (submission.status === 'graded') {
      res.status(400);
      throw new Error('This submission has already been graded and cannot be changed');
    }
    submission.content = content || '';
    submission.attachments = attachments || [];
    submission.submittedAt = new Date();
    submission.status = status;
    await submission.save();
  } else {
    submission = await Submission.create({
      assignment: assignmentId,
      student: req.user._id,
      content: content || '',
      attachments: attachments || [],
      status,
    });
  }

  // Notify the teacher
  await notifyUser(assignment.teacher, {
    title: 'New submission received',
    message: `${req.user.name} submitted "${assignment.title}".`,
    type: 'assignment',
  });

  res.status(201).json(submission);
});

// @route GET /api/submissions/me  (student)
exports.getMySubmissions = asyncHandler(async (req, res) => {
  const subs = await Submission.find({ student: req.user._id })
    .populate({ path: 'assignment', select: 'title maxMarks dueDate course', populate: { path: 'course', select: 'title code' } })
    .sort({ submittedAt: -1 });
  res.json(subs);
});

// @route GET /api/submissions/assignment/:assignmentId  (teacher/admin)
exports.getForAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.assignmentId);
  if (!assignment) {
    res.status(404);
    throw new Error('Assignment not found');
  }
  if (req.user.role !== 'admin' && !assignment.teacher.equals(req.user._id)) {
    res.status(403);
    throw new Error('Not authorized');
  }
  const subs = await Submission.find({ assignment: req.params.assignmentId })
    .populate('student', 'name email rollNumber')
    .sort({ submittedAt: -1 });
  res.json(subs);
});

// @route GET /api/submissions/pending  (teacher) — ungraded submissions across their assignments
exports.getPending = asyncHandler(async (req, res) => {
  const myAssignments = await Assignment.find({ teacher: req.user._id }).select('_id');
  const ids = myAssignments.map((a) => a._id);
  const subs = await Submission.find({ assignment: { $in: ids }, status: { $ne: 'graded' } })
    .populate('student', 'name email rollNumber')
    .populate('assignment', 'title maxMarks')
    .sort({ submittedAt: -1 });
  res.json(subs);
});

// @route PUT /api/submissions/:id/grade  (teacher/admin)
exports.gradeSubmission = asyncHandler(async (req, res) => {
  const { grade, feedback } = req.body;
  const submission = await Submission.findById(req.params.id).populate('assignment', 'title teacher maxMarks');
  if (!submission) {
    res.status(404);
    throw new Error('Submission not found');
  }
  if (req.user.role !== 'admin' && !submission.assignment.teacher.equals(req.user._id)) {
    res.status(403);
    throw new Error('Not authorized to grade this submission');
  }
  if (grade === undefined || grade === null || isNaN(grade)) {
    res.status(400);
    throw new Error('A numeric grade is required');
  }

  submission.grade = Number(grade);
  submission.feedback = feedback || '';
  submission.status = 'graded';
  submission.gradedAt = new Date();
  submission.gradedBy = req.user._id;
  await submission.save();

  await notifyUser(submission.student, {
    title: 'Assignment graded ⭐',
    message: `Your submission for "${submission.assignment.title}" was graded: ${grade}/${submission.assignment.maxMarks}.`,
    type: 'grade',
  });

  res.json(submission);
});
