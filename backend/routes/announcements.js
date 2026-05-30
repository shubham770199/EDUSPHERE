const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const c = require('../controllers/announcementController');

router.use(protect);

router.get('/', c.getAnnouncements);
router.post('/', authorize('teacher', 'admin'), c.createAnnouncement);
router.delete('/:id', authorize('teacher', 'admin'), c.deleteAnnouncement);

module.exports = router;
