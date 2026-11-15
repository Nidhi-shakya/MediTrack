// ==============================================================================
// MediTrack Authentication Routes
// [Requirement 1: JWT Authentication & Login]
// ==============================================================================

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { loginRateLimiter } = require('../middleware/rateLimiter');

// POST /api/auth/login - Authenticate staff member with PIN/Password (Rate Limited)
router.post('/login', loginRateLimiter, authController.login);

// GET /api/auth/me - Retrieve current verified session user
router.get('/me', authenticateToken, authController.getMe);

module.exports = router;

