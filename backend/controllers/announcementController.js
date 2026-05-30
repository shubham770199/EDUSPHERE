const asyncHandler = require('../utils/asyncHandler');
const Announcement = require('../models/Announcement');
const Course = require('../models/Course');
const User = require('../models/User');
const { notifyUsers } = require('../utils/notify');

// @route GET /api/announcements  — role-aware feed
exports.getAnnouncements = asyncHandler(async (req, res) => {
  const role = req.user.role;
  let filter = {};
  if (role === 'student') {
    const courses = await Course.find({ students: req.user._id }).select('_id');
    filter = {
      $or: [
        { audience: 'all' },
        { audience: 'students' },
        { audience: 'course', course: { $in: courses.map((c) => c._id) } },
      ],
    };
  } else if (role === 'teacher') {
    filter = { $or: [{ audience: 'all' }, { audience: 'teachers' }, { author: req.user._id }] };
  }
  // admin → all
  const announcements = await Announcement.find(filter)
    .populate('author', 'name role')
    .populate('course', 'title code')
    .sort({ createdAt: -1 })
    .limit(50);
  res.json(announcements);
});

// @route POST /api/announcements  (teacher/admin)
exports.createAnnouncement = asyncHandler(async (req, res) => {
  const { title, message, audience, course, priority } = req.body;
  if (!title || !message) {
    res.status(400);
    throw new Error('Title and message are required');
  }
  const announcement = await Announcement.create({
    title,
    message,
    audience: audience || 'all',
    course: course || null,
    priority: priority || 'normal',
    author: req.user._id,
  });

  // Fan out notifications to the relevant audience
  let recipients = [];
  if (announcement.audience === 'course' && course) {
    const c = await Course.findById(course).select('students');
    recipients = c ? c.students : [];
  } else if (announcement.audience === 'students') {
    recipients = (await User.find({ role: 'student' }).select('_id')).map((u) => u._id);
  } else if (announcement.audience === 'teachers') {
    recipients = (await User.find({ role: 'teacher' }).select('_id')).map((u) => u._id);
  } else {
    recipients = (await User.find({ _id: { $ne: req.user._id } }).select('_id')).map((u) => u._id);
  }
  if (recipients.length) {
    await notifyUsers(recipients, {
      title: `📢 ${title}`,
      message,
      type: 'announcement',
    });
  }

  res.status(201).json(await Announcement.findById(announcement._id).populate('author', 'name role'));
});

// @route DELETE /api/announcements/:id  (author/admin)
exports.deleteAnnouncement = asyncHandler(async (req, res) => {
  const a = await Announcement.findById(req.params.id);
  if (!a) {
    res.status(404);
    throw new Error('Announcement not found');
  }
  if (req.user.role !== 'admin' && !a.author.equals(req.user._id)) {
    res.status(403);
    throw new Error('Not authorized to delete this announcement');
  }
  await a.deleteOne();
  res.json({ message: 'Announcement deleted' });
});
