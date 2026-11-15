// ==============================================================================
// MediTrack Authentication Routes
// [Requirement 1: JWT Authentication & Login]
// ==============================================================================

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// POST /api/auth/login - Authenticate staff member with PIN/Password
router.post('/login', authController.login);

// GET /api/auth/me - Retrieve current verified session user
router.get('/me', authenticateToken, authController.getMe);

module.exports = router;

