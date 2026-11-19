const EMERGENCY_PATTERNS = [
  /\b(chest pain|heart attack|angina)\b/i,
  /\b(trouble breathing|shortness of breath|difficulty breathing|cannot breathe|suffocating|choking)\b/i,
  /\b(stroke|paralysis|facial drooping|slurred speech|arm weakness)\b/i,
  /\b(unconscious|passed out|fainted|unresponsive|collapsed)\b/i,
  /\b(severe bleeding|uncontrolled bleeding|coughing blood|vomiting blood)\b/i,
  /\b(anaphylaxis|severe allergic reaction|throat closing)\b/i,
  /\b(suicide|self harm|kill myself|end my life)\b/i,
  /\b(seizure|convulsions|epileptic fit)\b/i,
  /\b(poison|poisoning|overdose)\b/i,
];

const DISCLAIMER_TEXT =
  'MediTrack AI provides general healthcare education and clinic guidance only. It is not a clinical diagnostic tool and does not prescribe medication. Always consult a qualified physician or healthcare specialist for personal medical decisions.';

const SUGGESTED_QUESTIONS = [
  {
    id: 'bp_reading',
    question: 'What is a blood pressure reading?',
    category: 'Vitals & Diagnostics',
  },
  {
    id: 'healthy_lifestyle',
    question: 'How can I maintain a healthy lifestyle?',
    category: 'Wellness & Prevention',
  },
  {
    id: 'cbc_test',
    question: 'What does a CBC test measure?',
    category: 'Lab Tests & Pathology',
  },
  {
    id: 'organize_records',
    question: 'How should I organize my medical records?',
    category: 'Healthcare Management',
  },
];

const KNOWLEDGE_BASE = [
  {
    keywords: [
      'blood pressure',
      'bp reading',
      'systolic',
      'diastolic',
      'hypertension',
      'hypotension',
      '120/80',
    ],
    answer: `Blood pressure measures the force of circulating blood against the walls of your arteries. It is recorded as two numbers measured in millimeters of mercury (mmHg):

• Systolic (Top Number): The pressure in your arteries when your heart beats and pumps blood.
• Diastolic (Bottom Number): The pressure in your arteries when your heart rests between beats.

Standard Adult Guidelines:
• Normal: Less than 120/80 mmHg
• Elevated: Systolic 120–129 and Diastolic less than 80
• Stage 1 Hypertension: Systolic 130–139 or Diastolic 80–89
• Stage 2 Hypertension: Systolic 140 or higher, or Diastolic 90 or higher
• Hypotension (Low BP): Generally below 90/60 mmHg

Tips for Accurate Measurement:
Rest quietly for 5 minutes before checking, avoid caffeine or smoking for 30 minutes beforehand, keep your feet flat on the floor, and support your arm at heart level.`,
  },
  {
    keywords: [
      'healthy lifestyle',
      'maintain health',
      'wellness',
      'stay fit',
      'healthy habits',
      'longevity',
    ],
    answer: `Maintaining a healthy lifestyle involves consistent daily habits across five core pillars:

1. Balanced Nutrition:
• Focus on whole grains, fresh vegetables, lean proteins, pulses, and seasonal fruits.
• Limit ultra-processed foods, refined sugars, and excessive dietary sodium.
• Maintain adequate hydration (approx. 2 to 3 liters of water daily, depending on climate and activity).

2. Regular Physical Activity:
• Aim for at least 150 minutes of moderate aerobic exercise (brisk walking, cycling, swimming) or 75 minutes of vigorous exercise weekly.
• Include resistance or strength training twice a week.

3. Restorative Sleep:
• Target 7 to 9 hours of uninterrupted sleep nightly.
• Keep a consistent bedtime schedule and limit blue screen exposure before sleep.

4. Stress Management:
• Practice daily relaxation techniques such as deep diaphragmatic breathing, meditation, or light yoga.
• Maintain social connections with family and friends.

5. Preventive Screenings:
• Schedule routine annual physical check-ups, blood pressure monitoring, and basic blood profiles.`,
  },
  {
    keywords: [
      'cbc',
      'complete blood count',
      'hemoglobin',
      'white blood cell',
      'wbc',
      'rbc',
      'platelet',
      'blood test',
    ],
    answer: `A Complete Blood Count (CBC) is one of the most common diagnostic blood tests. It evaluates your overall health and helps screen for conditions like anemia, infection, inflammation, and bleeding disorders.

Key Components of a CBC:

• Red Blood Cells (RBCs) & Hemoglobin:
RBCs transport oxygen from your lungs to the rest of your body. Low hemoglobin or RBC count often suggests anemia, while high levels may indicate dehydration or bone marrow disorders.

• White Blood Cells (WBCs):
Your immune system's primary defense against infections. Elevated WBC counts often signal an active bacterial, viral, or inflammatory response. Low levels can indicate immune suppression.

• Platelets (Thrombocytes):
Essential cellular fragments responsible for normal blood clotting. Low platelets (thrombocytopenia) increase bruising and bleeding risks; elevated counts may point to acute inflammation.

• Hematocrit (HCT) & Red Cell Indices (MCV, MCH, MCHC):
Help doctors assess the concentration, size, and hemoglobin content of your red blood cells to determine the specific cause of anemia.`,
  },
  {
    keywords: [
      'organize',
      'medical records',
      'prescriptions',
      'lab reports',
      'health documents',
      'manage records',
    ],
    answer: `Organizing your personal and family medical records ensures seamless consultations, avoids duplicated lab tests, and speeds up emergency care:

1. Digital Archival:
• Keep scanned PDF copies or clear photos of discharge summaries, diagnostic imaging (X-rays, MRI), and prescriptions.
• Use cloud storage or personal health record apps with secure backups.

2. Chronological Ordering:
• In physical folders, arrange records reverse-chronologically (most recent documents on top).
• Separate documents by category: Lab Reports, Digital Prescriptions (like MediTrack OPD), Imaging, and Vaccinations.

3. Maintain a 1-Page Emergency Summary:
• Full Name, Date of Birth, and Blood Group.
• Active Medications with exact dosages and schedules.
• Known Allergies (e.g., Penicillin, Sulfa drugs, latex, food allergies).
• Chronic Conditions (e.g., Type 2 Diabetes, Hypertension).
• Emergency Contact Names and Phone Numbers.

4. Track Prescription Dates:
• Always retain prior prescriptions so your attending doctor can review drug interactions and clinical history.`,
  },
  {
    keywords: ['fever', 'temperature', 'pyrexia', 'high temp', 'paracetamol'],
    answer: `A fever is your body's natural physiological defense mechanism against viral or bacterial infections.

General Guidelines:
• Normal adult oral temperature is typically around 98.6°F (37°C), fluctuating slightly between 97°F and 99°F throughout the day.
• Low-grade fever: 99.5°F to 100.4°F
• Moderate fever: 100.5°F to 102.2°F
• High fever: 102.3°F and above

Home Care Measures:
• Stay well-hydrated with water, electrolyte solutions, or warm broths.
• Wear light, breathable clothing and rest adequately.
• Use tepid sponge baths if temperature is high.

When to Seek Immediate Medical Evaluation:
• Temperature exceeds 103°F (39.4°C) or lasts longer than 3 consecutive days.
• Accompanied by stiff neck, confusion, persistent vomiting, rash, or breathing difficulty.`,
  },
  {
    keywords: ['headache', 'migraine', 'head pain', 'tension headache'],
    answer: `Headaches are common and arise from various physiological triggers:

Common Types:
• Tension Headache: Dull, aching bilateral pain, often feeling like a tight band around the forehead, triggered by stress, eye strain, or poor posture.
• Migraine: Throbbing, usually unilateral pain often accompanied by nausea, sensitivity to light, sound, or visual aura.
• Sinus Headache: Facial pressure, congestion, and pain around the forehead and cheekbones.

Supportive Measures:
• Rest in a quiet, dark room.
• Apply a cool compress to your forehead or a warm cloth to the neck.
• Drink water to rule out mild dehydration.
• Practice gentle neck stretches and reduce digital screen glare.

Emergency Warning Signs (Seek Urgent Care):
• "Thunderclap" headache: Sudden, excruciating headache reaching peak intensity within seconds.
• Headache following head trauma.
• Headache accompanied by high fever, confusion, seizure, or neurological weakness.`,
  },
  {
    keywords: ['diabetes', 'sugar', 'glucose', 'hba1c', 'insulin'],
    answer: `Diabetes mellitus occurs when your body either cannot produce enough insulin or cannot effectively utilize the insulin it produces.

Key Blood Tests:
• Fasting Blood Sugar (FBS): Normal is under 100 mg/dL; 100–125 indicates prediabetes; 126+ on two tests indicates diabetes.
• Post-Prandial (2 hours after meal): Normal is under 140 mg/dL; 140–199 indicates prediabetes; 200+ indicates diabetes.
• HbA1c (3-month average): Normal is below 5.7%; 5.7%–6.4% indicates prediabetes; 6.5%+ indicates diabetes.

Lifestyle Recommendations:
• Adopt a consistent low-glycemic diet with complex carbohydrates and high fiber.
• Engage in daily walking or physical activity.
• Regularly check foot health and maintain scheduled physician follow-ups.`,
  },
];

const checkEmergency = (message) => {
  if (!message || typeof message !== 'string') return false;
  return EMERGENCY_PATTERNS.some((pattern) => pattern.test(message));
};

const queryGeminiAPI = async (apiKey, message, history = []) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;

  const systemInstruction = `You are MediTrack AI Health Assistant, an educational conversational healthcare assistant for a modern outpatient clinic (OPD).
RULES:
1. Provide helpful, structured, clear, and easy-to-understand health education.
2. NEVER diagnose illnesses or prescribe/adjust medications.
3. If the user describes any emergency or life-threatening symptoms, advise them to immediately dial emergency services (112 or 102).
4. Always remind the user to consult Dr. A. Verma or their attending physician for clinical decisions.
5. Use concise bullet points and readable paragraphs.`;

  const contents = [];

  if (Array.isArray(history)) {
    const validHistory = history.slice(-6);
    for (const item of validHistory) {
      if (item && item.content && (item.role === 'user' || item.role === 'model' || item.role === 'assistant')) {
        contents.push({
          role: item.role === 'assistant' ? 'model' : item.role,
          parts: [{ text: String(item.content) }],
        });
      }
    }
  }

  contents.push({
    role: 'user',
    parts: [{ text: message }],
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      systemInstruction: {
        parts: [{ text: systemInstruction }],
      },
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 800,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API returned status ${response.status}`);
  }

  const data = await response.json();
  const candidate = data.candidates?.[0];
  const replyText = candidate?.content?.parts?.[0]?.text;

  if (!replyText) {
    throw new Error('Empty response received from Gemini model');
  }

  return replyText.trim();
};

const findKnowledgeMatch = (message) => {
  const clean = message.toLowerCase();

  for (const item of KNOWLEDGE_BASE) {
    const matched = item.keywords.some((kw) => clean.includes(kw));
    if (matched) {
      return item.answer;
    }
  }

  return `Thank you for reaching out to MediTrack AI Health Assistant.

I can assist you with general healthcare education, including:
• Understanding vital signs (Blood Pressure, Heart Rate, Temperature, SpO2)
• Explaining standard diagnostic laboratory tests (such as CBC, HbA1c, Lipid Profiles)
• Healthy lifestyle, hydration, nutrition, and exercise recommendations
• Best practices for managing your prescriptions and personal health records
• How to book outpatient consultation tokens and navigate MediTrack clinic services

If you have specific clinical symptoms or require diagnosis and medical treatment, please book an appointment with our consulting physician (Dr. A. Verma) via the Booking tab or consult a licensed medical professional.`;
};

const processChatMessage = async ({ message, history = [] }) => {
  const trimmed = (message || '').trim();

  if (checkEmergency(trimmed)) {
    return {
      reply: `🚨 MEDICAL EMERGENCY WARNING:

Your inquiry mentions potential life-threatening or acute symptoms. MediTrack automated AI cannot evaluate acute emergencies.

Please take immediate action:
1. Immediately call 112 (National Emergency Helpline) or 102 (Ambulance).
2. If available, have someone escort you to the nearest hospital Emergency Room (ER) / Casualty Department.
3. Stay in a safe, seated or lying position while emergency responders arrive.

Do not wait for online responses or delay seeking emergency medical evaluation.`,
      isEmergency: true,
      timestamp: new Date().toISOString(),
      disclaimer: DISCLAIMER_TEXT,
      source: 'emergency_detector',
    };
  }

  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (geminiApiKey && geminiApiKey.trim() && !geminiApiKey.includes('PLACEHOLDER')) {
    try {
      const aiReply = await queryGeminiAPI(geminiApiKey.trim(), trimmed, history);
      return {
        reply: aiReply,
        isEmergency: false,
        timestamp: new Date().toISOString(),
        disclaimer: DISCLAIMER_TEXT,
        source: 'gemini_ai',
      };
    } catch (err) {
      console.warn('Gemini API call failed, falling back to local health engine:', err.message);
    }
  }

  const fallbackAnswer = findKnowledgeMatch(trimmed);

  return {
    reply: fallbackAnswer,
    isEmergency: false,
    timestamp: new Date().toISOString(),
    disclaimer: DISCLAIMER_TEXT,
    source: 'meditrack_health_engine',
  };
};

module.exports = {
  processChatMessage,
  checkEmergency,
  SUGGESTED_QUESTIONS,
  DISCLAIMER_TEXT,
};
