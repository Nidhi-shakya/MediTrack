const EMERGENCY_REGEX =
  /(chest pain|heart attack|difficulty breathing|shortness of breath|trouble breathing|stroke|paralysis|unconscious|fainted|severe bleeding|anaphylaxis|poison|suicide)/i;

const DISCLAIMER_TEXT =
  'MediTrack AI provides general healthcare education and clinic guidance only. It is not a clinical diagnostic tool and does not prescribe medication. Always consult a qualified physician or healthcare specialist for personal medical decisions.';

const SUGGESTED_QUESTIONS = [
  { id: 'bp_reading', question: 'What is a blood pressure reading?', category: 'Vitals & Diagnostics' },
  { id: 'healthy_lifestyle', question: 'How can I maintain a healthy lifestyle?', category: 'Wellness & Prevention' },
  { id: 'cbc_test', question: 'What does a CBC test measure?', category: 'Lab Tests & Pathology' },
  { id: 'organize_records', question: 'How should I organize my medical records?', category: 'Healthcare Management' },
];

const ANSWERS = {
  bp: `Blood pressure measures the pressure of circulating blood on artery walls in mmHg:
• Systolic (Top Number): Arterial pressure when the heart beats and pumps blood.
• Diastolic (Bottom Number): Arterial pressure when the heart rests between beats.

Standard Adult Guidelines:
• Normal: Below 120/80 mmHg
• Elevated: Systolic 120–129 and Diastolic below 80
• Stage 1 Hypertension: Systolic 130–139 or Diastolic 80–89
• Stage 2 Hypertension: Systolic 140+ or Diastolic 90+
• Low BP (Hypotension): Below 90/60 mmHg

Measurement Tip: Rest for 5 minutes quietly before measurement and keep your arm supported at heart level.`,

  lifestyle: `Maintaining a healthy lifestyle involves consistent habits across core wellness areas:
1. Balanced Nutrition: Whole grains, fresh seasonal vegetables, lean proteins, pulses, and drinking 2-3 liters of water daily.
2. Regular Exercise: At least 150 minutes of moderate physical activity (such as brisk walking or cycling) each week.
3. Restful Sleep: 7 to 9 hours of quality, uninterrupted sleep every night.
4. Stress Reduction: Daily relaxation breathing, mindfulness, or yoga.
5. Preventive Screenings: Routine annual check-ups and monitoring vital signs.`,

  cbc: `A Complete Blood Count (CBC) is a standard blood test evaluating cellular components:
• Red Blood Cells (RBC) & Hemoglobin: Deliver oxygen from your lungs to tissues. Low levels indicate anemia.
• White Blood Cells (WBC): Immune defense cells fighting bacterial and viral infections.
• Platelets: Essential cell fragments required for blood clotting and wound healing.
• Hematocrit: Percentage of blood volume composed of red blood cells.`,

  records: `Organizing medical records helps streamline doctor consultations:
1. Chronological Order: Keep records reverse-chronologically with newest reports on top.
2. Group by Category: Separate Lab Tests, Digital Prescriptions, Imaging (X-Ray/MRI), and Immunizations.
3. Emergency Summary Card: List your Blood Group, Active Medications, Allergies, and Emergency Contacts.
4. Digital Backups: Save photos or PDFs in secure cloud storage.`,

  default: `Welcome to MediTrack AI Health Assistant.

I can assist with general healthcare education:
• Understanding vital signs (Blood Pressure, Heart Rate, SpO2, Temperature)
• Explaining diagnostic tests (such as CBC, Blood Sugar, Lipid Profiles)
• Healthy lifestyle, hydration, nutrition, and exercise recommendations
• Managing digital prescriptions and medical records

For specific medical diagnosis or treatment, please book an appointment with our consulting physician (Dr. A. Verma) via the Booking tab.`,
};

const checkEmergency = (message) => {
  return typeof message === 'string' && EMERGENCY_REGEX.test(message);
};

const findAnswer = (message) => {
  const q = message.toLowerCase();
  if (q.includes('blood pressure') || q.includes('bp reading') || q.includes('systolic') || q.includes('diastolic')) return ANSWERS.bp;
  if (q.includes('lifestyle') || q.includes('healthy') || q.includes('fitness') || q.includes('wellness')) return ANSWERS.lifestyle;
  if (q.includes('cbc') || q.includes('complete blood count') || q.includes('hemoglobin') || q.includes('white blood') || q.includes('platelet')) return ANSWERS.cbc;
  if (q.includes('organize') || q.includes('records') || q.includes('prescription')) return ANSWERS.records;
  return ANSWERS.default;
};

const queryGemini = async (apiKey, message) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
  const systemPrompt = 'You are MediTrack AI Health Assistant. Provide clear, simple, educational health explanations. Never diagnose or prescribe medicines. Remind users to consult Dr. A. Verma for personal medical decisions.';

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: message }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: { temperature: 0.3, maxOutputTokens: 600 },
    }),
  });

  if (!res.ok) throw new Error(`Gemini status ${res.status}`);
  const json = await res.json();
  return json.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
};

const processChatMessage = async ({ message }) => {
  const trimmed = (message || '').trim();

  if (checkEmergency(trimmed)) {
    return {
      reply: `🚨 MEDICAL EMERGENCY WARNING:

Your inquiry mentions potential life-threatening symptoms. Automated AI cannot evaluate emergencies.

Please take immediate action:
1. Call 112 (National Emergency Helpline) or 102 (Ambulance) immediately.
2. Have someone escort you to the nearest hospital Emergency Room (ER).
3. Rest quietly in a safe position while help arrives.`,
      isEmergency: true,
      timestamp: new Date().toISOString(),
      disclaimer: DISCLAIMER_TEXT,
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey.trim() && !apiKey.includes('PLACEHOLDER')) {
    try {
      const aiReply = await queryGemini(apiKey.trim(), trimmed);
      if (aiReply) {
        return {
          reply: aiReply,
          isEmergency: false,
          timestamp: new Date().toISOString(),
          disclaimer: DISCLAIMER_TEXT,
        };
      }
    } catch (err) {
      console.warn('Gemini offline, using built-in health engine:', err.message);
    }
  }

  return {
    reply: findAnswer(trimmed),
    isEmergency: false,
    timestamp: new Date().toISOString(),
    disclaimer: DISCLAIMER_TEXT,
  };
};

module.exports = {
  processChatMessage,
  checkEmergency,
  SUGGESTED_QUESTIONS,
  DISCLAIMER_TEXT,
};
