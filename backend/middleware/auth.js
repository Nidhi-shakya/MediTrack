// ==============================================================================
// MediTrack JWT Authentication Middleware
// [Requirement 1 & 2: Token Verification, Expiry Handling, HTTP 401 Codes]
// ==============================================================================

const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// [Phase 1: Security] Secure JWT Secret handling - no predictable hardcoded secret in production
let JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  if (process.env.NODE_ENV === 'test') {
    JWT_SECRET = 'test_suite_jwt_secret_key_fixed_length_64_bytes_entropy_abc123';
  } else {
    JWT_SECRET = crypto.randomBytes(32).toString('hex');
    console.warn('⚠️ [SECURITY NOTICE] JWT_SECRET environment variable is not set. A secure random runtime secret was generated.');
  }
}

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Authentication token is missing.',
      code: 'AUTH_TOKEN_MISSING',
    });
  }

  // Token format: "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization header format. Expected format: Bearer <token>',
      code: 'MALFORMED_AUTH_HEADER',
    });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, username, role, name }
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Your session has expired. Please sign in again.',
        code: 'TOKEN_EXPIRED',
        expiredAt: error.expiredAt,
      });
    }

    if (error.name === 'JsonWebTokenError' || error.name === 'SyntaxError' || error instanceof SyntaxError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid security token provided.',
        code: 'INVALID_TOKEN',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Token verification failed.',
      code: 'AUTH_FAILED',
    });
  }
};

module.exports = {
  authenticateToken,
  JWT_SECRET,
};
