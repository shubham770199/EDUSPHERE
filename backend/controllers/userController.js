const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const Course = require('../models/Course');
const { publicUser } = require('./authController');

// @route GET /api/users        (admin)  — supports ?role=&search=
exports.getUsers = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.search) {
    filter.$or = [
      { name: new RegExp(req.query.search, 'i') },
      { email: new RegExp(req.query.search, 'i') },
    ];
  }
  const users = await User.find(filter).sort({ createdAt: -1 });
  res.json(users.map(publicUser));
});

// @route GET /api/users/:id    (admin)
exports.getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).populate('enrolledCourses', 'title code');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json(publicUser(user));
});

// @route POST /api/users       (admin) — create any role, including teacher/admin
exports.createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, department, rollNumber, phone } = req.body;
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email and password are required');
  }
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    res.status(400);
    throw new Error('Email already in use');
  }
  const user = await User.create({
    name,
    email,
    password,
    role: ['student', 'teacher', 'admin'].includes(role) ? role : 'student',
    department,
    rollNumber,
    phone,
  });
  res.status(201).json(publicUser(user));
});

// @route PUT /api/users/:id    (admin) — update role / status / profile
exports.updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  const { name, role, status, department, rollNumber, phone } = req.body;
  if (name !== undefined) user.name = name;
  if (role && ['student', 'teacher', 'admin'].includes(role)) user.role = role;
  if (status && ['active', 'pending', 'suspended'].includes(status)) user.status = status;
  if (department !== undefined) user.department = department;
  if (rollNumber !== undefined) user.rollNumber = rollNumber;
  if (phone !== undefined) user.phone = phone;
  await user.save();
  res.json(publicUser(user));
});

// @route DELETE /api/users/:id (admin)
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  if (user._id.equals(req.user._id)) {
    res.status(400);
    throw new Error('You cannot delete your own account');
  }
  // Clean up course memberships
  await Course.updateMany({ students: user._id }, { $pull: { students: user._id } });
  await user.deleteOne();
  res.json({ message: 'User deleted' });
});
