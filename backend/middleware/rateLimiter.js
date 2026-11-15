// ==============================================================================
// MediTrack Security Middleware: Rate Limiting
// [Phase 1: Security Improvements - Brute Force Protection]
// ==============================================================================

const rateLimit = require('express-rate-limit');

/**
 * Login Rate Limiter
 * Protects staff authentication endpoint against brute-force credential stuffing.
 * Limits each IP address to 15 login attempts per 15 minutes.
 */
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 15, // Max 15 attempts per IP per window
  standardHeaders: true, // Return standard RateLimit-* headers
  legacyHeaders: false, // Disable obsolete X-RateLimit-* headers
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  skip: () => process.env.NODE_ENV === 'test', // Bypass during automated testing so test suites run fast
});

module.exports = {
  loginRateLimiter,
};
