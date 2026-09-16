const jwt = require('jsonwebtoken');
const { ApiError } = require('./errorHandler');

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-for-inventory-app-2026';

/**
 * Middleware to verify JWT bearer token on incoming requests.
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return next(new ApiError(401, 'Access denied. Authentication token required.', 'UNAUTHORIZED'));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return next(new ApiError(401, 'Invalid or expired authentication token.', 'UNAUTHORIZED'));
  }
}

/**
 * Helper function to generate JWT token.
 */
function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

module.exports = {
  authenticateToken,
  generateToken,
  JWT_SECRET
};
