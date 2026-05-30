const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const c = require('../controllers/authController');

router.post('/register', c.register);
router.post('/login', c.login);
router.get('/me', protect, c.getMe);
router.put('/profile', protect, c.updateProfile);
router.put('/password', protect, c.changePassword);

module.exports = router;
