// ==============================================================================
// MediTrack Patient & Queue Routes
// [Requirement 2 & 3: Authorization, Privacy Protection & Sanitized Views]
// ==============================================================================

const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { validatePatientRegistration } = require('../middleware/validator');

// 1. Public Queue Board Endpoint (NO Authentication Required, Privacy-Masked)
// [Requirement 3: Protects phone numbers and private symptoms from public exposure]
router.get('/public-queue', patientController.getPublicQueue);

// 2. Patient Registration / Token Booking Endpoint (Public & Walk-in)
router.post('/', validatePatientRegistration, patientController.registerPatient);

// 3. Complete Patient Queue Roster (Staff Only - Protected by JWT)
// [Requirement 2: Full Clinical Details require valid Staff JWT]
router.get('/', authenticateToken, patientController.getAllPatients);

// 4. Update Patient Status (Waiting -> In-Consultation -> Completed)
// Protected: Authenticated Staff (Reception or Doctor)
router.put('/:id', authenticateToken, patientController.updatePatientStatus);

// 5. Delete Patient Record
// Protected: Reception Staff Only (Doctors cannot delete queue records)
router.delete(
  '/:id',
  authenticateToken,
  requireRole('reception'),
  patientController.deletePatient
);

module.exports = router;
