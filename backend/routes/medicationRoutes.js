const express = require('express');
const {
  getAllMedications,
  getMedicationById,
  createMedication,
  updateMedication,
  deleteMedication,
  logDose,
} = require('../controllers/medicationController');

const router = express.Router();

router.get('/', getAllMedications);
router.post('/', createMedication);
router.get('/:id', getMedicationById);
router.put('/:id', updateMedication);
router.delete('/:id', deleteMedication);
router.post('/:id/dose', logDose);

module.exports = router;
