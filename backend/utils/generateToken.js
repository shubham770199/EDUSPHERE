const jwt = require('jsonwebtoken');

// Sign a JWT containing the user id. Expiry is configurable via env.
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });

module.exports = generateToken;
