const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const c = require('../controllers/analyticsController');

router.use(protect);

router.get('/admin', authorize('admin'), c.adminAnalytics);
router.get('/teacher', authorize('teacher', 'admin'), c.teacherAnalytics);
router.get('/student', authorize('student'), c.studentAnalytics);

module.exports = router;
