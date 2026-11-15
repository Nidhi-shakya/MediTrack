// ==============================================================================
// MediTrack Automated Smart Triage Engine
// [Requirement 6: Triage & Risk Assessment with Decision-Support Disclaimers]
// ==============================================================================

/**
 * CLINICAL DECISION-SUPPORT DISCLAIMER:
 * 
 * MediTrack Automated Smart Triage is an algorithmic decision-support tool
 * designed solely for queue prioritization, non-urgent scheduling, and educational
 * academic demonstration. It is NOT a diagnostic medical device, does NOT replace
 * a clinical evaluation by a licensed physician, and is NOT clinically validated.
 * 
 * Attending medical doctors and triage nurses retain sole clinical responsibility
 * for all patient assessments, triage priority overrides, and medical care decisions.
 */

const TRIAGE_DISCLAIMER =
  'MediTrack triage is an algorithmic queue decision-support tool for educational demonstration. ' +
  'It does not constitute a medical diagnosis. Attending doctors retain final clinical judgment.';

const EMERGENCY_NOTICE =
  'CRITICAL ALERT: If experiencing severe chest pain, acute shortness of breath, loss of consciousness, ' +
  'or signs of stroke, seek immediate emergency medical services (Call 112 / 102) without waiting.';

// Keywords for acute red-flag symptoms requiring urgent clinical review
const RED_FLAG_SYMPTOMS = [
  'chest pain',
  'heart pain',
  'breathing difficulty',
  'shortness of breath',
  'breathless',
  'unconscious',
  'fainting',
  'severe bleeding',
  'stroke',
  'paralysis',
  'seizure',
  'head injury',
];

/**
 * Calculates triage priority and risk estimate for queue ordering.
 * 
 * Categories:
 * - High (Priority 1, ~85% estimated urgency score):
 *   Criteria: Age >= 65 OR Temperature >= 102°F OR Presence of red-flag symptoms.
 * 
 * - Medium (Priority 2, ~50% estimated urgency score):
 *   Criteria: Age >= 50 OR Temperature >= 100°F.
 * 
 * - Normal (Priority 3, ~15% estimated urgency score):
 *   Criteria: Routine outpatient consultation.
 * 
 * @param {Object} patientData - { age, temperature, symptoms }
 * @returns {Object} Triage analysis result
 */
function evaluateTriage(patientData = {}) {
  const age = Number(patientData.age) || 0;
  const temperature = Number(patientData.temperature) || 98.6;
  const symptoms = String(patientData.symptoms || '').toLowerCase();

  const detectedRedFlags = RED_FLAG_SYMPTOMS.filter((flag) =>
    symptoms.includes(flag)
  );

  const hasCriticalSymptoms = detectedRedFlags.length > 0;
  const isHighFever = temperature >= 102.0;
  const isGeriatricUrgent = age >= 65;

  // Rule 1: High Urgency
  if (isGeriatricUrgent || isHighFever || hasCriticalSymptoms) {
    const reasons = [];
    if (hasCriticalSymptoms) reasons.push(`Critical symptom indicator: ${detectedRedFlags.join(', ')}`);
    if (isHighFever) reasons.push(`High fever recorded (${temperature}°F >= 102°F)`);
    if (isGeriatricUrgent) reasons.push(`Geriatric risk factor (Age ${age} >= 65)`);

    return {
      priority: 'High',
      riskScore: 85,
      isEmergency: hasCriticalSymptoms,
      clinicalRationale: reasons.join('; '),
      emergencyNotice: hasCriticalSymptoms ? EMERGENCY_NOTICE : null,
      disclaimer: TRIAGE_DISCLAIMER,
    };
  }

  // Rule 2: Medium Urgency
  const isModerateFever = temperature >= 100.0;
  const isSeniorAdult = age >= 50;

  if (isSeniorAdult || isModerateFever) {
    const reasons = [];
    if (isModerateFever) reasons.push(`Moderate pyrexia (${temperature}°F)`);
    if (isSeniorAdult) reasons.push(`Senior demographic assessment (Age ${age})`);

    return {
      priority: 'Medium',
      riskScore: 50,
      isEmergency: false,
      clinicalRationale: reasons.join('; '),
      emergencyNotice: null,
      disclaimer: TRIAGE_DISCLAIMER,
    };
  }

  // Rule 3: Routine / Normal Priority
  return {
    priority: 'Normal',
    riskScore: 15,
    isEmergency: false,
    clinicalRationale: 'Standard outpatient consultation vitals and presentation',
    emergencyNotice: null,
    disclaimer: TRIAGE_DISCLAIMER,
  };
}

module.exports = {
  evaluateTriage,
  TRIAGE_DISCLAIMER,
  EMERGENCY_NOTICE,
  RED_FLAG_SYMPTOMS,
};

