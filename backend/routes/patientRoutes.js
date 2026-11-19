const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { validatePatientRegistration } = require('../middleware/validator');

router.get('/public-queue', patientController.getPublicQueue);

router.post('/', validatePatientRegistration, patientController.registerPatient);

router.get('/', authenticateToken, patientController.getAllPatients);

router.post(
  '/call-next',
  authenticateToken,
  requireRole(['doctor', 'reception']),
  patientController.callNextPatient
);

router.put('/:id', authenticateToken, patientController.updatePatientStatus);

router.delete(
  '/:id',
  authenticateToken,
  requireRole('reception'),
  patientController.deletePatient
);

module.exports = router;

