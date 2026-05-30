const asyncHandler = require('../utils/asyncHandler');
const Course = require('../models/Course');
const User = require('../models/User');
const { notifyUser } = require('../utils/notify');

const populated = (q) =>
  q.populate('teacher', 'name email department').populate('students', 'name email rollNumber');

// @route GET /api/courses  — role-aware listing
exports.getCourses = asyncHandler(async (req, res) => {
  let filter = {};
  if (req.user.role === 'teacher') filter = { teacher: req.user._id };
  else if (req.user.role === 'student') filter = { students: req.user._id };
  // admin → all
  const courses = await populated(Course.find(filter)).sort({ createdAt: -1 });
  res.json(courses);
});

// @route GET /api/courses/available  — courses a student is NOT enrolled in
exports.getAvailableCourses = asyncHandler(async (req, res) => {
  const courses = await populated(
    Course.find({ students: { $ne: req.user._id } })
  ).sort({ title: 1 });
  res.json(courses);
});

// @route GET /api/courses/:id
exports.getCourse = asyncHandler(async (req, res) => {
  const course = await populated(Course.findById(req.params.id));
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  res.json(course);
});

// @route POST /api/courses  (teacher/admin)
exports.createCourse = asyncHandler(async (req, res) => {
  const { title, code, description, department, credits, semester, schedule, color } = req.body;
  if (!title || !code) {
    res.status(400);
    throw new Error('Course title and code are required');
  }
  // Admins may assign a teacher; teachers own the course they create.
  const teacher = req.user.role === 'admin' && req.body.teacher ? req.body.teacher : req.user._id;

  const course = await Course.create({
    title,
    code,
    description,
    department,
    credits,
    semester,
    schedule,
    color,
    teacher,
  });
  res.status(201).json(await populated(Course.findById(course._id)));
});

// @route PUT /api/courses/:id  (owner teacher / admin)
exports.updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  if (req.user.role !== 'admin' && !course.teacher.equals(req.user._id)) {
    res.status(403);
    throw new Error('You can only edit your own courses');
  }
  const fields = ['title', 'code', 'description', 'department', 'credits', 'semester', 'schedule', 'color'];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) course[f] = req.body[f];
  });
  await course.save();
  res.json(await populated(Course.findById(course._id)));
});

// @route DELETE /api/courses/:id  (owner teacher / admin)
exports.deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  if (req.user.role !== 'admin' && !course.teacher.equals(req.user._id)) {
    res.status(403);
    throw new Error('You can only delete your own courses');
  }
  await User.updateMany({ enrolledCourses: course._id }, { $pull: { enrolledCourses: course._id } });
  await course.deleteOne();
  res.json({ message: 'Course deleted' });
});

// @route POST /api/courses/:id/enroll  — student self-enroll OR teacher/admin adds a student
exports.enroll = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  const studentId =
    req.user.role === 'student' ? req.user._id : req.body.studentId;
  if (!studentId) {
    res.status(400);
    throw new Error('studentId is required');
  }

  if (course.students.some((s) => s.equals(studentId))) {
    res.status(400);
    throw new Error('Student already enrolled in this course');
  }

  course.students.push(studentId);
  await course.save();
  await User.findByIdAndUpdate(studentId, { $addToSet: { enrolledCourses: course._id } });

  await notifyUser(studentId, {
    title: 'Enrolled in a course',
    message: `You are now enrolled in ${course.title} (${course.code}).`,
    type: 'success',
  });

  res.json(await populated(Course.findById(course._id)));
});

// @route POST /api/courses/:id/unenroll
exports.unenroll = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  const studentId = req.user.role === 'student' ? req.user._id : req.body.studentId;
  course.students = course.students.filter((s) => !s.equals(studentId));
  await course.save();
  await User.findByIdAndUpdate(studentId, { $pull: { enrolledCourses: course._id } });
  res.json(await populated(Course.findById(course._id)));
});
