const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const c = require('../controllers/attendanceController');

router.use(protect);

router.post('/', authorize('teacher', 'admin'), c.markAttendance);
router.get('/me', authorize('student'), c.getMyAttendance);
router.get('/course/:courseId', authorize('teacher', 'admin'), c.getCourseAttendance);
router.get('/student/:studentId', authorize('teacher', 'admin'), c.getStudentAttendance);

module.exports = router;
