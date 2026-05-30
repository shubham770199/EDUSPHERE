const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const c = require('../controllers/userController');

// All user-management routes are admin-only.
router.use(protect, authorize('admin'));

router.route('/').get(c.getUsers).post(c.createUser);
router.route('/:id').get(c.getUser).put(c.updateUser).delete(c.deleteUser);

module.exports = router;
