const asyncHandler = require('../utils/asyncHandler');
const Notification = require('../models/Notification');

// @route GET /api/notifications  — current user's notifications
exports.getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);
  const unread = await Notification.countDocuments({ user: req.user._id, read: false });
  res.json({ notifications, unread });
});

// @route PUT /api/notifications/:id/read
exports.markRead = asyncHandler(async (req, res) => {
  const n = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { read: true },
    { new: true }
  );
  if (!n) {
    res.status(404);
    throw new Error('Notification not found');
  }
  res.json(n);
});

// @route PUT /api/notifications/read-all
exports.markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
  res.json({ message: 'All notifications marked as read' });
});

// @route DELETE /api/notifications/:id
exports.deleteNotification = asyncHandler(async (req, res) => {
  await Notification.deleteOne({ _id: req.params.id, user: req.user._id });
  res.json({ message: 'Notification deleted' });
});
