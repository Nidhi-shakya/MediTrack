const storage = require('../services/storageService');
const { evaluateTriage } = require('../services/triageEngine');

const getPublicQueue = async (req, res, next) => {
  try {
    const allPatients = await storage.getPatients();

    const sanitizedQueue = allPatients
      .filter((p) => p.status === 'Waiting' || p.status === 'In-Consultation')
      .map((p, idx) => ({
        _id: p._id,
        tokenNumber: p.tokenNumber,
        name: storage.maskPatientName(p.name), 
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

const registerPatient = async (req, res, next) => {
  try {
    const { name, age, gender, phone, temperature, symptoms } = req.body;

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

