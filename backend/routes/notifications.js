const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const c = require('../controllers/notificationController');

router.use(protect);

router.get('/', c.getMyNotifications);
router.put('/read-all', c.markAllRead);
router.put('/:id/read', c.markRead);
router.delete('/:id', c.deleteNotification);

module.exports = router;
