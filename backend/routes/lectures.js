const express = require('express');
const multer = require('multer');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const c = require('../controllers/lectureController');

// Store the upload in memory, then stream it to S3. 500 MB cap for lecture videos.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) cb(null, true);
    else cb(new Error('Only video files are allowed'));
  },
});

router.use(protect);

router.get('/', c.getLectures);
router.post('/', authorize('teacher', 'admin'), upload.single('video'), c.createLecture);
router.get('/:id', c.getLecture);
router.delete('/:id', authorize('teacher', 'admin'), c.deleteLecture);

module.exports = router;
