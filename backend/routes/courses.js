const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const c = require('../controllers/courseController');

router.use(protect);

router.get('/', c.getCourses);
router.get('/available', c.getAvailableCourses);
router.post('/', authorize('teacher', 'admin'), c.createCourse);
router.get('/:id', c.getCourse);
router.put('/:id', authorize('teacher', 'admin'), c.updateCourse);
router.delete('/:id', authorize('teacher', 'admin'), c.deleteCourse);
router.post('/:id/enroll', c.enroll); // student self-enroll or teacher/admin add
router.post('/:id/unenroll', c.unenroll);

module.exports = router;
