const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { notifyUser } = require('../utils/notify');

// Shape the user object returned to the client (no password).
const publicUser = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  role: u.role,
  rollNumber: u.rollNumber,
  department: u.department,
  phone: u.phone,
  bio: u.bio,
  avatar: u.avatar,
  badges: u.badges,
  status: u.status,
  createdAt: u.createdAt,
  updatedAt: u.updatedAt,
});

// @route POST /api/auth/register
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role, department, rollNumber, phone } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email and password are required');
  }

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    res.status(400);
    throw new Error('An account with this email already exists');
  }

  // Only allow self-registration as student or teacher. Admins are seeded / created by an admin.
  const safeRole = ['student', 'teacher'].includes(role) ? role : 'student';

  const user = await User.create({
    name,
    email,
    password,
    role: safeRole,
    department: department || 'General',
    rollNumber: rollNumber || '',
    phone: phone || '',
  });

  await notifyUser(user._id, {
    title: 'Welcome to EduSphere! 🎓',
    message: `Hi ${user.name}, your ${safeRole} account is ready. Explore your dashboard to get started.`,
    type: 'success',
  });

  res.status(201).json({ token: generateToken(user._id), user: publicUser(user) });
});

// @route POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (user.status === 'suspended') {
    res.status(403);
    throw new Error('Your account has been suspended. Contact an administrator.');
  }

  res.json({ token: generateToken(user._id), user: publicUser(user) });
});

// @route GET /api/auth/me
exports.getMe = asyncHandler(async (req, res) => {
  res.json({ user: publicUser(req.user) });
});

// @route PUT /api/auth/profile
exports.updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { name, department, phone, bio, avatar, rollNumber } = req.body;

  if (name !== undefined) user.name = name;
  if (department !== undefined) user.department = department;
  if (phone !== undefined) user.phone = phone;
  if (bio !== undefined) user.bio = bio;
  if (avatar !== undefined) user.avatar = avatar;
  if (rollNumber !== undefined) user.rollNumber = rollNumber;

  await user.save();
  res.json({ user: publicUser(user) });
});

// @route PUT /api/auth/password
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    res.status(400);
    throw new Error('New password must be at least 6 characters');
  }

  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.matchPassword(currentPassword || ''))) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();
  res.json({ message: 'Password updated successfully' });
});

exports.publicUser = publicUser;
