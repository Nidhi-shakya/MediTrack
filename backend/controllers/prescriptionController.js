// ==============================================================================
// MediTrack Digital Prescription Controller
// [Requirement 2 & 13: Doctor Authorization & Automatic Patient Completion]
// ==============================================================================

const storage = require('../services/storageService');

/**
 * Create Digital Prescription & Mark Consultation Complete
 * Protected: Doctor Role Only
 */
const createPrescription = async (req, res, next) => {
  try {
    const { patientId, diagnosis, medicines, notes, doctorName } = req.body;

    const patient = await storage.getPatientById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found to link prescription.',
        code: 'PATIENT_NOT_FOUND',
      });
    }

    const prescriptionPayload = {
      patientId: patient._id,
      patientName: patient.name,
      tokenNumber: patient.tokenNumber,
      doctorName: doctorName || req.user.name || 'Dr. A. Verma (MBBS, MD - General Medicine)',
      diagnosis: diagnosis.trim(),
      medicines,
      notes: notes ? notes.trim() : 'Drink plenty of water and follow prescribed dosages.',
    };

    const savedPrescription = await storage.createPrescription(prescriptionPayload);

    return res.status(201).json({
      success: true,
      message: `Prescription issued successfully. Patient ${patient.tokenNumber} marked as Completed.`,
      data: savedPrescription,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve All Digital Prescriptions
 * Protected: Authenticated Staff (Doctor and Reception)
 */
const getAllPrescriptions = async (req, res, next) => {
  try {
    const list = await storage.getPrescriptions();

    return res.status(200).json({
      success: true,
      count: list.length,
      data: list,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPrescription,
  getAllPrescriptions,
};
