const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const c = require('../controllers/chatController');

router.post('/', protect, c.chat);

module.exports = router;
