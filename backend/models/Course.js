const mongoose = require('mongoose');

const scheduleSlotSchema = new mongoose.Schema(
  {
    day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] },
    time: { type: String }, // e.g. "09:00 AM"
    room: { type: String },
  },
  { _id: false }
);

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, default: '' },
    department: { type: String, default: 'General' },
    credits: { type: Number, default: 3 },
    semester: { type: String, default: 'Fall 2026' },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    schedule: { type: [scheduleSlotSchema], default: [] },
    color: { type: String, default: '#6366f1' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Course', courseSchema);
