const storage = require('../services/storageService');

const MEDICATION_DISCLAIMER =
  'MediTrack Medication Reminder is an assistive tracking tool. Dosages and medication schedules must be strictly followed as prescribed by a registered medical practitioner.';

const VALID_FREQUENCIES = [
  'Once Daily',
  'Twice Daily',
  'Thrice Daily',
  'Four Times Daily',
  'Every 8 Hours',
  'Every 12 Hours',
  'Weekly',
  'As Needed',
];

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

const getAllMedications = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const medications = await storage.getMedications({ status, search });

    res.status(200).json({
      success: true,
      count: medications.length,
      data: medications,
      disclaimer: MEDICATION_DISCLAIMER,
    });
  } catch (err) {
    next(err);
  }
};

const getMedicationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const medication = await storage.getMedicationById(id);

    if (!medication) {
      return res.status(404).json({
        success: false,
        error: `Medication record with ID '${id}' was not found.`,
      });
    }

    res.status(200).json({
      success: true,
      data: medication,
      disclaimer: MEDICATION_DISCLAIMER,
    });
  } catch (err) {
    next(err);
  }
};

const createMedication = async (req, res, next) => {
  try {
    const { name, dosage, frequency, times, startDate, endDate, instructions, patientName } =
      req.body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Medicine name must be at least 2 characters.',
      });
    }

    if (!dosage || typeof dosage !== 'string' || !dosage.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Dosage is required (e.g., 500mg, 1 tablet).',
      });
    }

    if (!frequency || !VALID_FREQUENCIES.includes(frequency)) {
      return res.status(400).json({
        success: false,
        error: `Invalid frequency. Accepted values: ${VALID_FREQUENCIES.join(', ')}`,
      });
    }

    if (!Array.isArray(times) || times.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one reminder time is required.',
      });
    }

    const invalidTime = times.find((t) => typeof t !== 'string' || !TIME_REGEX.test(t));
    if (invalidTime) {
      return res.status(400).json({
        success: false,
        error: `Invalid time format '${invalidTime}'. Use 24-hour HH:mm format (e.g., 08:00, 20:00).`,
      });
    }

    if (!startDate || isNaN(Date.parse(startDate))) {
      return res.status(400).json({
        success: false,
        error: 'Valid start date is required.',
      });
    }

    if (!endDate || isNaN(Date.parse(endDate))) {
      return res.status(400).json({
        success: false,
        error: 'Valid end date is required.',
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      return res.status(400).json({
        success: false,
        error: 'End date cannot be prior to start date.',
      });
    }

    const created = await storage.createMedication({
      name: name.trim(),
      dosage: dosage.trim(),
      frequency,
      times,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      instructions: (instructions || 'Take with water after food.').trim(),
      patientName: (patientName || 'Self').trim(),
      logs: [],
    });

    res.status(201).json({
      success: true,
      message: 'Medication reminder scheduled successfully.',
      data: created,
      disclaimer: MEDICATION_DISCLAIMER,
    });
  } catch (err) {
    next(err);
  }
};

const updateMedication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await storage.getMedicationById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: `Medication with ID '${id}' was not found.`,
      });
    }

    const updates = { ...req.body };

    if (updates.name && (typeof updates.name !== 'string' || updates.name.trim().length < 2)) {
      return res.status(400).json({
        success: false,
        error: 'Medicine name must be at least 2 characters.',
      });
    }

    if (updates.frequency && !VALID_FREQUENCIES.includes(updates.frequency)) {
      return res.status(400).json({
        success: false,
        error: `Invalid frequency. Accepted values: ${VALID_FREQUENCIES.join(', ')}`,
      });
    }

    if (updates.times) {
      if (!Array.isArray(updates.times) || updates.times.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'At least one reminder time is required.',
        });
      }
      const invalidTime = updates.times.find((t) => typeof t !== 'string' || !TIME_REGEX.test(t));
      if (invalidTime) {
        return res.status(400).json({
          success: false,
          error: `Invalid time format '${invalidTime}'. Use 24-hour HH:mm format.`,
        });
      }
    }

    if (updates.startDate && updates.endDate) {
      const start = new Date(updates.startDate);
      const end = new Date(updates.endDate);
      if (end < start) {
        return res.status(400).json({
          success: false,
          error: 'End date cannot be prior to start date.',
        });
      }
    }

    const updated = await storage.updateMedication(id, updates);

    res.status(200).json({
      success: true,
      message: 'Medication updated successfully.',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

const deleteMedication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await storage.getMedicationById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: `Medication with ID '${id}' was not found.`,
      });
    }

    await storage.deleteMedication(id);

    res.status(200).json({
      success: true,
      message: 'Medication record deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};

const logDose = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date, time, status } = req.body;

    const existing = await storage.getMedicationById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: `Medication with ID '${id}' was not found.`,
      });
    }

    if (!date || isNaN(Date.parse(date))) {
      return res.status(400).json({
        success: false,
        error: 'Valid date is required (YYYY-MM-DD).',
      });
    }

    if (!time || !TIME_REGEX.test(time)) {
      return res.status(400).json({
        success: false,
        error: 'Valid 24-hour time is required (HH:mm).',
      });
    }

    if (!['Taken', 'Skipped'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Status must be either 'Taken' or 'Skipped'.",
      });
    }

    const updated = await storage.logMedicationDose(id, { date, time, status });

    res.status(200).json({
      success: true,
      message: `Dose logged as ${status}.`,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllMedications,
  getMedicationById,
  createMedication,
  updateMedication,
  deleteMedication,
  logDose,
};
