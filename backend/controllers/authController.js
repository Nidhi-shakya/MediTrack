// ==============================================================================
// MediTrack Staff Authentication Controller
// [Requirement 1: Real JWT Auth, Bcrypt Verification, Token Expiration]
// ==============================================================================

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const storage = require('../services/storageService');
const { JWT_SECRET } = require('../middleware/auth');

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

/**
 * Staff Login Handler
 * Authenticates staff with role/username and password/PIN, returns JWT.
 */
const login = async (req, res, next) => {
  try {
    const { pin, password, role, username } = req.body;
    const credential = password || pin;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'Security PIN or password is required.',
        code: 'MISSING_CREDENTIALS',
      });
    }

    // Lookup staff by username or role
    const identifier = username || role || 'reception';
    let staff = await storage.findStaffByUsername(identifier);

    if (!staff) {
      staff = await storage.findStaffByRole(identifier);
    }

    if (!staff) {
      return res.status(401).json({
        success: false,
        message: 'Invalid staff credentials or unrecognized role.',
        code: 'INVALID_CREDENTIALS',
      });
    }

    // Bcrypt hash comparison
    const isMatch = await bcrypt.compare(String(credential).trim(), staff.passwordHash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed: Incorrect security PIN.',
        code: 'INVALID_CREDENTIALS',
      });
    }

    // Generate real JWT token with configurable expiration
    const payload = {
      id: staff._id,
      username: staff.username,
      role: staff.role,
      name: staff.name,
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    return res.status(200).json({
      success: true,
      message: `Staff authenticated successfully as ${staff.role.toUpperCase()}.`,
      token,
      expiresIn: JWT_EXPIRES_IN,
      user: {
        id: staff._id,
        username: staff.username,
        role: staff.role,
        name: staff.name,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Current Authenticated Staff Profile
 */
const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
};

module.exports = {
  login,
  getMe,
};
