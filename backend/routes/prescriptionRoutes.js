const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { validatePrescriptionInput } = require('../middleware/validator');

router.post(
  '/',
  authenticateToken,
  requireRole('doctor'),
  validatePrescriptionInput,
  prescriptionController.createPrescription
);

router.get('/', authenticateToken, prescriptionController.getAllPrescriptions);

router.get(
  '/patient/:patientId',
  authenticateToken,
  requireRole('doctor'),
  prescriptionController.getPrescriptionByPatientId
);

module.exports = router;

