const mongoose = require('mongoose');

const lectureSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // S3 object key (the file lives in the bucket; URLs are signed on demand).
    videoKey: { type: String, required: true },
    fileName: { type: String, default: '' },
    contentType: { type: String, default: 'video/mp4' },
    size: { type: Number, default: 0 }, // bytes
    durationSeconds: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lecture', lectureSchema);
