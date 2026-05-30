const asyncHandler = require('../utils/asyncHandler');
const Lecture = require('../models/Lecture');
const Course = require('../models/Course');
const { uploadBuffer, getPlaybackUrl, deleteObject, isConfigured } = require('../config/s3');
const { notifyUsers } = require('../utils/notify');
const { notifyZapier } = require('../utils/zapier');

// Build a safe, unique S3 key for an uploaded video.
const buildKey = (courseId, originalName) => {
  const safe = (originalName || 'lecture.mp4').replace(/[^a-zA-Z0-9._-]/g, '_');
  return `lectures/${courseId}/${Date.now()}_${safe}`;
};

// Attach a fresh signed playback URL to a lecture document.
const withUrl = async (lec) => {
  const obj = lec.toObject ? lec.toObject() : lec;
  let videoUrl = null;
  try {
    videoUrl = await getPlaybackUrl(obj.videoKey);
  } catch {
    videoUrl = null;
  }
  return { ...obj, videoUrl };
};

// @route POST /api/lectures  (teacher/admin) — multipart: video file + fields
exports.createLecture = asyncHandler(async (req, res) => {
  if (!isConfigured()) {
    res.status(503);
    throw new Error('Video storage (AWS S3) is not configured on the server');
  }
  if (!req.file) {
    res.status(400);
    throw new Error('No video file uploaded (field name must be "video")');
  }
  const { title, description, course, durationSeconds } = req.body;
  if (!title || !course) {
    res.status(400);
    throw new Error('Title and course are required');
  }

  const courseDoc = await Course.findById(course);
  if (!courseDoc) {
    res.status(404);
    throw new Error('Course not found');
  }
  if (req.user.role !== 'admin' && !courseDoc.teacher.equals(req.user._id)) {
    res.status(403);
    throw new Error('You can only upload lectures to your own courses');
  }

  const key = buildKey(course, req.file.originalname);
  await uploadBuffer(key, req.file.buffer, req.file.mimetype);

  const lecture = await Lecture.create({
    title,
    description: description || '',
    course,
    teacher: req.user._id,
    videoKey: key,
    fileName: req.file.originalname,
    contentType: req.file.mimetype,
    size: req.file.size,
    durationSeconds: Number(durationSeconds) || 0,
  });

  // Notify enrolled students
  if (courseDoc.students.length) {
    await notifyUsers(courseDoc.students, {
      title: 'New lecture available 🎬',
      message: `"${title}" was uploaded to ${courseDoc.title}.`,
      type: 'announcement',
    });
  }

  // Optional best-effort external webhook
  notifyZapier({
    event: 'lecture_uploaded',
    title,
    course: courseDoc.title,
    teacher: req.user.name,
  });

  res.status(201).json(await withUrl(lecture));
});

// @route GET /api/lectures  — role-aware list with signed playback URLs
exports.getLectures = asyncHandler(async (req, res) => {
  let filter = {};
  if (req.user.role === 'student') {
    const courses = await Course.find({ students: req.user._id }).select('_id');
    filter = { course: { $in: courses.map((c) => c._id) } };
  } else if (req.user.role === 'teacher') {
    filter = { teacher: req.user._id };
  }
  const lectures = await Lecture.find(filter)
    .populate('course', 'title code color')
    .populate('teacher', 'name')
    .sort({ createdAt: -1 });

  const withUrls = await Promise.all(lectures.map(withUrl));
  res.json(withUrls);
});

// @route GET /api/lectures/:id  — single lecture + signed URL (increments views)
exports.getLecture = asyncHandler(async (req, res) => {
  const lecture = await Lecture.findById(req.params.id)
    .populate('course', 'title code students teacher')
    .populate('teacher', 'name');
  if (!lecture) {
    res.status(404);
    throw new Error('Lecture not found');
  }

  // Access check: students must be enrolled in the course.
  if (req.user.role === 'student') {
    const enrolled = lecture.course.students.some((s) => s.equals(req.user._id));
    if (!enrolled) {
      res.status(403);
      throw new Error('You are not enrolled in this course');
    }
    await Lecture.updateOne({ _id: lecture._id }, { $inc: { views: 1 } });
  }

  res.json(await withUrl(lecture));
});

// @route DELETE /api/lectures/:id  (owner teacher / admin)
exports.deleteLecture = asyncHandler(async (req, res) => {
  const lecture = await Lecture.findById(req.params.id);
  if (!lecture) {
    res.status(404);
    throw new Error('Lecture not found');
  }
  if (req.user.role !== 'admin' && !lecture.teacher.equals(req.user._id)) {
    res.status(403);
    throw new Error('You can only delete your own lectures');
  }
  try {
    await deleteObject(lecture.videoKey);
  } catch {
    /* object may already be gone — continue */
  }
  await lecture.deleteOne();
  res.json({ message: 'Lecture deleted' });
});
