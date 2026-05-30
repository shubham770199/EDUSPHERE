const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const c = require('../controllers/submissionController');

router.use(protect);

router.post('/', authorize('student'), c.submit);
router.get('/me', authorize('student'), c.getMySubmissions);
router.get('/pending', authorize('teacher', 'admin'), c.getPending);
router.get('/assignment/:assignmentId', authorize('teacher', 'admin'), c.getForAssignment);
router.put('/:id/grade', authorize('teacher', 'admin'), c.gradeSubmission);

module.exports = router;
