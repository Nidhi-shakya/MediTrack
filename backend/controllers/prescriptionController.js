const storage = require('../services/storageService');

const createPrescription = async (req, res, next) => {
  try {
    const { patientId, diagnosis, medicines, notes, doctorNotes, followUpDate, doctorName } = req.body;

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
      notes: (notes || doctorNotes || 'Drink plenty of warm water and take medications as prescribed.').trim(),
      doctorNotes: (doctorNotes || notes || '').trim(),
      followUpDate: followUpDate || 'After 3 Days',
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

const getPrescriptionByPatientId = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const history = await storage.getPrescriptionsByPatientId(patientId);

    return res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPrescription,
  getAllPrescriptions,
  getPrescriptionByPatientId,
};

