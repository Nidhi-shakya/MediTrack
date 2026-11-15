// ==============================================================================
// MediTrack Digital Prescription Routes
// [Requirement 2 & 13: Doctor Authorization & Prescription Management]
// ==============================================================================

const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { validatePrescriptionInput } = require('../middleware/validator');

// 1. Issue Digital Prescription (Doctor Role Clearance Required)
router.post(
  '/',
  authenticateToken,
  requireRole('doctor'),
  validatePrescriptionInput,
  prescriptionController.createPrescription
);

// 2. Retrieve Prescriptions History (Authenticated Staff Only)
router.get('/', authenticateToken, prescriptionController.getAllPrescriptions);

module.exports = router;
