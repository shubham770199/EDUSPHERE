const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const c = require('../controllers/assignmentController');

router.use(protect);

router.get('/', c.getAssignments);
router.post('/', authorize('teacher', 'admin'), c.createAssignment);
router.get('/:id', c.getAssignment);
router.put('/:id', authorize('teacher', 'admin'), c.updateAssignment);
router.delete('/:id', authorize('teacher', 'admin'), c.deleteAssignment);

module.exports = router;
