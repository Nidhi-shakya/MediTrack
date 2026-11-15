// ==============================================================================
// MediTrack Request Input Validation Middleware
// [Requirement 8: Consistent Validation & Error Prevention]
// ==============================================================================

const validatePatientRegistration = (req, res, next) => {
  const { name, age, gender, phone, temperature, symptoms } = req.body;
  const errors = [];

  // Name validation
  if (!name || typeof name !== 'string' || name.trim().length < 3) {
    errors.push('Patient name must be at least 3 characters long.');
  }

  // Age validation
  const numAge = Number(age);
  if (age === undefined || age === null || isNaN(numAge) || numAge < 1 || numAge > 120) {
    errors.push('Age must be a valid integer between 1 and 120 years.');
  }

  // Gender validation
  if (!gender || !['Male', 'Female', 'Other'].includes(gender)) {
    errors.push('Gender must be Male, Female, or Other.');
  }

  // Indian phone number regex
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phone || !phoneRegex.test(String(phone).trim())) {
    errors.push('Phone must be a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.');
  }

  // Temperature validation
  const numTemp = Number(temperature);
  if (temperature === undefined || temperature === null || isNaN(numTemp) || numTemp < 95 || numTemp > 108) {
    errors.push('Body temperature must be between 95.0°F and 108.0°F.');
  }

  // Symptoms validation
  if (!symptoms || typeof symptoms !== 'string' || symptoms.trim().length < 4) {
    errors.push('Symptoms description must be at least 4 characters long.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed on patient registration data.',
      errors,
    });
  }

  // Clean data
  req.body.name = name.trim();
  req.body.age = Math.floor(numAge);
  req.body.phone = String(phone).trim();
  req.body.temperature = Number(numTemp.toFixed(1));
  req.body.symptoms = symptoms.trim();

  next();
};

const validatePrescriptionInput = (req, res, next) => {
  const { patientId, diagnosis, medicines } = req.body;
  const errors = [];

  if (!patientId) {
    errors.push('Patient ID is required to link the prescription.');
  }

  if (!diagnosis || typeof diagnosis !== 'string' || diagnosis.trim().length < 3) {
    errors.push('Clinical diagnosis must be at least 3 characters long.');
  }

  if (!Array.isArray(medicines) || medicines.length === 0) {
    errors.push('Prescription must contain at least one medication item.');
  } else {
    medicines.forEach((med, idx) => {
      if (!med.medicineName || typeof med.medicineName !== 'string' || med.medicineName.trim().length < 2) {
        errors.push(`Medicine #${idx + 1}: Name is required.`);
      }
      const allowedDosages = ['1-0-0', '1-0-1', '0-0-1', '1-1-1', '0-1-0', 'As Needed'];
      if (!med.dosage || !allowedDosages.includes(med.dosage)) {
        errors.push(`Medicine #${idx + 1}: Dosage must be one of [${allowedDosages.join(', ')}].`);
      }
      if (!med.duration || typeof med.duration !== 'string' || med.duration.trim().length === 0) {
        errors.push(`Medicine #${idx + 1}: Duration is required (e.g. 5 Days).`);
      }
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed on prescription data.',
      errors,
    });
  }

  next();
};

module.exports = {
  validatePatientRegistration,
  validatePrescriptionInput,
};
