// ==============================================================================
// MediTrack Patient Management Controller
// [Requirement 2 & 3: Authorization, Privacy Protection & Sanitized Views]
// ==============================================================================

const storage = require('../services/storageService');
const { evaluateTriage } = require('../services/triageEngine');

/**
 * Public Queue View (Unauthenticated / Public Waiting Display)
 * [Requirement 3: Patient Data Privacy - Masked Name, NO Phone, NO Symptoms]
 */
const getPublicQueue = async (req, res, next) => {
  try {
    const allPatients = await storage.getPatients();

    // Filter to active queue items and sanitize all sensitive demographic/clinical fields
    const sanitizedQueue = allPatients
      .filter((p) => p.status === 'Waiting' || p.status === 'In-Consultation')
      .map((p, idx) => ({
        _id: p._id,
        tokenNumber: p.tokenNumber,
        name: storage.maskPatientName(p.name), // e.g. "Ramesh S."
        age: p.age,
        gender: p.gender,
        priority: p.priority,
        riskScore: p.riskScore,
        status: p.status,
        queuePosition: p.status === 'Waiting' ? idx : 0,
        estimatedWaitMinutes: p.status === 'Waiting' ? idx * 10 : 0,
        createdAt: p.createdAt,
      }));

    return res.status(200).json({
      success: true,
      count: sanitizedQueue.length,
      data: sanitizedQueue,
      meta: {
        privacyNotice: 'Patient identifiers and clinical symptoms are masked in public queue view.',
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Staff Patient Roster (Authenticated Reception & Doctor Only)
 * [Requirement 2: Full Clinical Details Accessible Only With Valid JWT]
 * [Phase 3 & 5: Supports Search by Name/Token and Pagination]
 */
const getAllPatients = async (req, res, next) => {
  try {
    const { search, status, page, limit } = req.query;
    const result = await storage.getPatients({ search, status, page, limit });

    if (page && limit && result.pagination) {
      return res.status(200).json({
        success: true,
        count: result.data.length,
        data: result.data,
        pagination: result.pagination,
        requestingStaff: {
          username: req.user.username,
          role: req.user.role,
        },
      });
    }

    const patients = Array.isArray(result) ? result : result.data;
    return res.status(200).json({
      success: true,
      count: patients.length,
      data: patients,
      requestingStaff: {
        username: req.user.username,
        role: req.user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Call Next Patient in Priority Queue
 * Automatically moves highest-urgency waiting patient to 'In-Consultation'
 * Protected: Reception & Doctor Staff
 */
const callNextPatient = async (req, res, next) => {
  try {
    const nextPatient = await storage.callNextPatient();

    if (!nextPatient) {
      return res.status(200).json({
        success: false,
        message: 'No patients currently waiting in queue.',
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Token ${nextPatient.tokenNumber} (${nextPatient.name}) is now called for consultation.`,
      data: nextPatient,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Register New Patient / Issue Token with Automated Smart Triage
 * Public or Front-Desk Patient Registration
 */
const registerPatient = async (req, res, next) => {
  try {
    const { name, age, gender, phone, temperature, symptoms } = req.body;

    // Run Algorithmic Triage & Risk Evaluation
    const triageResult = evaluateTriage({ age, temperature, symptoms });

    const patientPayload = {
      name,
      age,
      gender,
      phone,
      temperature,
      symptoms,
      priority: triageResult.priority,
      riskScore: triageResult.riskScore,
    };

    const newPatient = await storage.createPatient(patientPayload);

    return res.status(201).json({
      success: true,
      message: `Appointment registered successfully. Token ${newPatient.tokenNumber} allocated (${newPatient.priority} Priority).`,
      data: newPatient,
      triage: {
        priority: triageResult.priority,
        riskScore: triageResult.riskScore,
        clinicalRationale: triageResult.clinicalRationale,
        emergencyNotice: triageResult.emergencyNotice,
        disclaimer: triageResult.disclaimer,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Patient Status (Waiting -> In-Consultation -> Completed)
 * Protected: Requires Staff Authentication (Reception or Doctor)
 */
const updatePatientStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, priority } = req.body;

    const allowedStatuses = ['Waiting', 'In-Consultation', 'Completed'];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of [${allowedStatuses.join(', ')}].`,
        code: 'INVALID_STATUS',
      });
    }

    const updateFields = {};
    if (status) updateFields.status = status;
    if (priority) updateFields.priority = priority;

    const updatedPatient = await storage.updatePatient(id, updateFields);

    if (!updatedPatient) {
      return res.status(404).json({
        success: false,
        message: 'Patient record not found.',
        code: 'PATIENT_NOT_FOUND',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Patient ${updatedPatient.tokenNumber} status updated to '${updatedPatient.status}'.`,
      data: updatedPatient,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Patient Record from Queue
 * Protected: Reception Staff Only (Doctors cannot delete queue records)
 */
const deletePatient = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deleted = await storage.deletePatient(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Patient record not found or already deleted.',
        code: 'PATIENT_NOT_FOUND',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Patient record deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublicQueue,
  getAllPatients,
  registerPatient,
  updatePatientStatus,
  deletePatient,
  callNextPatient,
};

