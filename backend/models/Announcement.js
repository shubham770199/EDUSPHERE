const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // Who should see it
    audience: {
      type: String,
      enum: ['all', 'students', 'teachers', 'course'],
      default: 'all',
    },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: null },
    priority: { type: String, enum: ['low', 'normal', 'high'], default: 'normal' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Announcement', announcementSchema);
