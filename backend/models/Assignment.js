const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    dueDate: { type: Date, required: true },
    maxMarks: { type: Number, default: 100 },
    // Lightweight "attachment" references (names / urls). Real file storage is out of scope.
    attachments: { type: [{ name: String, url: String }], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Assignment', assignmentSchema);
