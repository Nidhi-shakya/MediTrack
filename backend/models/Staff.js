// ==============================================================================
// MediTrack Staff Authentication Model
// [Requirement 1: Proper Authentication with Bcrypt Password Hashing]
// ==============================================================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const staffSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Staff username is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: [true, 'Staff full name is required'],
      trim: true,
    },
    role: {
      type: String,
      required: [true, 'Staff role is required'],
      enum: {
        values: ['reception', 'doctor'],
        message: 'Role must be either reception or doctor',
      },
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Method to verify password against bcrypt hash
staffSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(String(candidatePassword), this.passwordHash);
};

module.exports = mongoose.model('Staff', staffSchema);

