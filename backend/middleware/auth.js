const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes: require a valid Bearer token and attach the user to req.user.
 */
const protect = async (req, res, next) => {
  let token;
  const header = req.headers.authorization;

  if (header && header.startsWith('Bearer ')) {
    token = header.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized, token invalid or expired' });
  }
};

/**
 * Restrict a route to one or more roles. Use after `protect`.
 * e.g. router.post('/', protect, authorize('teacher', 'admin'), handler)
 */
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res
      .status(403)
      .json({ message: `Access denied. Requires role: ${roles.join(' or ')}` });
  }
  next();
};

module.exports = { protect, authorize };
