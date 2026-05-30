// 404 handler for unmatched routes
const notFound = (req, res, next) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

// Central error handler
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error('💥 Error:', err.message);

  let status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || 'Server Error';

  // Mongoose duplicate key
  if (err.code === 11000) {
    status = 400;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `A record with that ${field} already exists`;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }

  // Invalid ObjectId
  if (err.name === 'CastError') {
    status = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  res.status(status).json({ message });
};

module.exports = { notFound, errorHandler };
