// ==============================================================================
// MediTrack Clinic Context & State Management
// [Requirement 1: Real JWT Handling, Expiry Interception, & Clean Session Storage]
// [Requirement 2 & 3: Role-Aware Queries & Public Queue Privacy Consumption]
// [Requirement 4: Pure Native Fetch API with Async/Await]
// [Requirement 5: Visible UI Alerts & Error Handling]
// [Requirement 10: Hooks & Context API with Multilingual Support]
// ==============================================================================

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

export const ClinicContext = createContext();

// Multilingual Dictionary: English, Hindi, Punjabi
const translations = {
  en: {
    brand: 'MediTrack',
    subBrand: 'Smart Outpatient Queue & Digital Prescription',
    navBook: 'Book Token',
    navQueue: 'Live Queue Board',
    navReception: 'Reception Desk',
    navDoctor: 'Doctor Portal',
    navLogin: 'Staff Login',
    navLogout: 'Sign Out',
    langName: 'English',
    badgeLive: 'LIVE QUEUE',
    totalWaiting: 'Patients Waiting',
    highPriority: 'Critical / High Triage',
    inConsult: 'In Consultation',
    completedToday: 'Consultations Done',
    avgWait: 'Est. Next Wait Time',
    mins: 'mins',
    token: 'Token',
    patient: 'Patient',
    age: 'Age',
    gender: 'Gender',
    phone: 'Phone',
    symptoms: 'Symptoms',
    temperature: 'Temp',
    priority: 'Triage Priority',
    riskScore: 'Risk Score',
    status: 'Status',
    waiting: 'Waiting',
    inConsultation: 'In-Consultation',
    completed: 'Completed',
    actions: 'Actions',
    callPatient: 'Call for Consultation',
    markComplete: 'Mark Completed',
    prescribe: 'Write Prescription',
    deleteRecord: 'Delete Record',
    high: 'High',
    medium: 'Medium',
    normal: 'Normal',
    emptyQueue: 'No patients in waiting queue right now.',
    bookAppointment: 'Patient Appointment & Token Registration',
    fullName: 'Full Name',
    enterName: 'Enter patient full name',
    enterPhone: '10-digit Indian phone (e.g. 9876543210)',
    enterAge: 'Age (1 - 120)',
    enterTemp: 'Temperature (95°F - 108°F)',
    describeSymptoms: 'Describe primary symptoms (e.g., Chest pain, fever...)',
    generateToken: 'Generate Smart Token',
    triageExplanation: 'Educational Decision Support: Algorithmic triage predicts urgency for queue sequencing. Not a medical diagnosis.',
    emergencyWarningTitle: 'Emergency Medical Advice',
    emergencyNotice: 'If experiencing severe chest pain, acute respiratory distress, or stroke symptoms, call emergency medical services (112 / 102) immediately.',
    prescriptionPad: 'Digital Prescription Pad',
    diagnosis: 'Diagnosis / Assessment',
    medicine: 'Medicine Name',
    dosage: 'Dosage (e.g. 1-0-1)',
    duration: 'Duration',
    addMedicine: '+ Add Another Medicine',
    clinicalNotes: 'Special Advice / Doctor Notes',
    saveAndPrint: 'Save & Print Digital Prescription',
    staffLoginTitle: 'Clinic Staff Authentication',
    enterPin: 'Enter Security PIN or Password',
    selectRole: 'Select Staff Role',
    receptionRole: 'Receptionist / Front Desk',
    doctorRole: 'Consulting Physician / Doctor',
    signIn: 'Verify & Sign In',
    demoPinHint: 'Staff PIN: 1234 (Bcrypt verified)',
  },
  hi: {
    brand: 'मेडीट्रैक',
    subBrand: 'स्मार्ट बाह्य रोगी कतार एवं डिजिटल पर्चा प्रणाली',
    navBook: 'टोकन बुक करें',
    navQueue: 'लाइव कतार बोर्ड',
    navReception: 'रिसेप्शन डेस्क',
    navDoctor: 'डॉक्टर पोर्टल',
    navLogin: 'स्टाफ लॉगिन',
    navLogout: 'लॉग आउट',
    langName: 'हिन्दी',
    badgeLive: 'लाइव कतार',
    totalWaiting: 'प्रतीक्षारत मरीज',
    highPriority: 'अति-गंभीर (उच्च प्राथमिकता)',
    inConsult: 'परामर्श कक्ष में',
    completedToday: 'परामर्श संपन्न',
    avgWait: 'अनुमानित प्रतीक्षा समय',
    mins: 'मिनट',
    token: 'टोकन नं',
    patient: 'मरीज का नाम',
    age: 'आयु',
    gender: 'लिंग',
    phone: 'मोबाइल नंबर',
    symptoms: 'लक्षण',
    temperature: 'तापमान',
    priority: 'प्राथमिकता स्तर',
    riskScore: 'जोखिम स्कोर',
    status: 'स्थिति',
    waiting: 'प्रतीक्षारत',
    inConsultation: 'परामर्श जारी',
    completed: 'पूर्ण',
    actions: 'कार्यवाही',
    callPatient: 'परामर्श हेतु बुलाएं',
    markComplete: 'संपन्न करें',
    prescribe: 'पर्चा लिखें',
    deleteRecord: 'रिकॉर्ड हटाएं',
    high: 'उच्च (High)',
    medium: 'मध्यम (Medium)',
    normal: 'सामान्य (Normal)',
    emptyQueue: 'इस समय कोई मरीज कतार में प्रतीक्षारत नहीं है।',
    bookAppointment: 'मरीज पंजीकरण एवं टोकन आवंटन',
    fullName: 'मरीज का पूरा नाम',
    enterName: 'पूरा नाम दर्ज करें',
    enterPhone: '10 अंकों का मोबाइल नंबर (उदा. 9876543210)',
    enterAge: 'आयु (1 से 120 वर्ष)',
    enterTemp: 'तापमान (95°F - 108°F)',
    describeSymptoms: 'लक्षणों का विवरण दें (उदा. सीने में दर्द, बुखार...)',
    generateToken: 'स्मार्ट टोकन जारी करें',
    triageExplanation: 'शैक्षणिक निर्णय-सहायता: एल्गोरिदम कतार क्रमबद्धता हेतु प्राथमिकता तय करता है। यह रोग निदान नहीं है।',
    emergencyWarningTitle: 'आपातकालीन चिकित्सकीय सलाह',
    emergencyNotice: 'यदि मरीज को सीने में तेज दर्द, सांस लेने में अत्यधिक तकलीफ या बेहोशी हो, तो अविलंब आपातकालीन सेवा (112 / 102) पर संपर्क करें।',
    prescriptionPad: 'डिजिटल डॉक्टर पर्चा',
    diagnosis: 'रोग निदान (Diagnosis)',
    medicine: 'दवा का नाम',
    dosage: 'खुराक (उदा. 1-0-1)',
    duration: 'अवधि',
    addMedicine: '+ नई दवा जोड़ें',
    clinicalNotes: 'विशेष परामर्श / निर्देश',
    saveAndPrint: 'पर्चा सहेजें और प्रिंट करें',
    staffLoginTitle: 'क्लिनिक स्टाफ प्रमाणीकरण',
    enterPin: 'सुरक्षा पिन दर्ज करें',
    selectRole: 'स्टाफ पद चुनें',
    receptionRole: 'रिसेप्शनिस्ट / फ्रंट डेस्क',
    doctorRole: 'चिकित्सक / डॉक्टर',
    signIn: 'प्रमाणीकृत करें एवं लॉगिन करें',
    demoPinHint: 'स्टाफ पिन: 1234',
  },
  pa: {
    brand: 'ਮੈਡੀਟਰੈਕ',
    subBrand: 'ਸਮਾਰਟ ਓਪੀਡੀ ਕਤਾਰ ਅਤੇ ਡਿਜੀਟਲ ਪਰਚੀ ਪ੍ਰਣਾਲੀ',
    navBook: 'ਟੋਕਨ ਲਵੋ',
    navQueue: 'ਲਾਈਵ ਕਤਾਰ ਬੋਰਡ',
    navReception: 'ਰਿਸੈਪਸ਼ਨ ਡੈਸਕ',
    navDoctor: 'ਡਾਕਟਰ ਪੋਰਟਲ',
    navLogin: 'ਸਟਾਫ ਲੌਗਇਨ',
    navLogout: 'ਲੌਗ ਆਉਟ',
    langName: 'ਪੰਜਾਬੀ',
    badgeLive: 'ਲਾਈਵ ਕਤਾਰ',
    totalWaiting: 'ਉਡੀਕ ਰਹੇ ਮਰੀਜ਼',
    highPriority: 'ਨਾਜ਼ੁਕ (ਉੱਚ ਤਰਜੀਹ)',
    inConsult: 'ਡਾਕਟਰ ਕੋਲ ਮਰੀਜ਼',
    completedToday: 'ਮੁਕੰਮਲ ਜਾਂਚ',
    avgWait: 'ਅੰਦਾਜ਼ਨ ਉਡੀਕ ਸਮਾਂ',
    mins: 'ਮਿੰਟ',
    token: 'ਟੋਕਨ ਨੰਬਰ',
    patient: 'ਮਰੀਜ਼ ਦਾ ਨਾਮ',
    age: 'ਉਮਰ',
    gender: 'ਲਿੰਗ',
    phone: 'ਮੋਬਾਈਲ ਨੰਬਰ',
    symptoms: 'ਲੱਛਣ',
    temperature: 'ਤਾਪਮਾਨ',
    priority: 'ਤਰਜੀਹ',
    riskScore: 'ਜੋਖਮ ਸਕੋਰ',
    status: 'ਸਥਿਤੀ',
    waiting: 'ਉਡੀਕ ਵਿੱਚ',
    inConsultation: 'ਜਾਂਚ ਜਾਰੀ',
    completed: 'ਸੰਪੂਰਨ',
    actions: 'ਕਾਰਵਾਈ',
    callPatient: 'ਜਾਂਚ ਲਈ ਬੁਲਾਓ',
    markComplete: 'ਮੁਕੰਮਲ ਕਰੋ',
    prescribe: 'ਨੁਸਖ਼ਾ ਲਿਖੋ',
    deleteRecord: 'ਰਿਕਾਰਡ ਹਟਾਓ',
    high: 'ਉੱਚ (High)',
    medium: 'ਦਰਮਿਆਨਾ (Medium)',
    normal: 'ਆਮ (Normal)',
    emptyQueue: 'ਇਸ ਵੇਲੇ ਕੋਈ ਮਰੀਜ਼ ਕਤਾਰ ਵਿੱਚ ਨਹੀਂ ਹੈ।',
    bookAppointment: 'ਮਰੀਜ਼ ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਅਤੇ ਸਮਾਰਟ ਟੋਕਨ',
    fullName: 'ਮਰੀਜ਼ ਦਾ ਪੂਰਾ ਨਾਮ',
    enterName: 'ਪੂਰਾ ਨਾਮ ਦਰਜ ਕਰੋ',
    enterPhone: '10 ਅੰਕਾਂ ਦਾ ਮੋਬਾਈਲ ਨੰਬਰ (ਜਿਵੇਂ 9876543210)',
    enterAge: 'ਉਮਰ (1 ਤੋਂ 120 ਸਾਲ)',
    enterTemp: 'ਤਾਪਮਾਨ (95°F - 108°F)',
    describeSymptoms: 'ਬਿਮਾਰੀ ਦੇ ਲੱਛਣ ਦੱਸੋ (ਜਿਵੇਂ ਛਾਤੀ ਵਿੱਚ ਦਰਦ, ਬੁਖ਼ਾਰ)',
    generateToken: 'ਸਮਾਰਟ ਟੋਕਨ ਜਾਰੀ ਕਰੋ',
    triageExplanation: 'ਸਿੱਖਿਆਤਮਕ ਫੈਸਲਾ-ਸਹਾਇਤਾ: ਐਲਗੋਰਿਦਮ ਕਤਾਰ ਤਰਜੀਹ ਨਿਰਧਾਰਤ ਕਰਦਾ ਹੈ। ਇਹ ਡਾਕਟਰੀ ਨਿਦਾਨ ਨਹੀਂ ਹੈ।',
    emergencyWarningTitle: 'ਐਮਰਜੈਂਸੀ ਡਾਕਟਰੀ ਚਿਤਾਵਨੀ',
    emergencyNotice: 'ਜੇਕਰ ਛਾਤੀ ਵਿੱਚ ਗੰਭੀਰ ਦਰਦ ਜਾਂ ਸਾਹ ਲੈਣ ਵਿੱਚ ਬਹੁਤ ਤਕਲੀਫ਼ ਹੋਵੇ, ਤਾਂ ਤੁਰੰਤ ਐਮਰਜੈਂਸੀ ਸੇਵਾ (112 / 102) ਨਾਲ ਸੰਪਰਕ ਕਰੋ।',
    prescriptionPad: 'ਡਿਜੀਟਲ ਡਾਕਟਰੀ ਪਰਚੀ',
    diagnosis: 'ਬਿਮਾਰੀ ਦੀ ਜਾਂਚ',
    medicine: 'ਦਵਾਈ ਦਾ ਨਾਮ',
    dosage: 'ਖੁਰਾਕ (ਜਿਵੇਂ 1-0-1)',
    duration: 'ਮਿਆਦ',
    addMedicine: '+ ਹੋਰ ਦਵਾਈ ਸ਼ਾਮਲ ਕਰੋ',
    clinicalNotes: 'ਵਿਸ਼ੇਸ਼ ਸਲਾਹ / ਨੋਟਸ',
    saveAndPrint: 'ਪਰਚੀ ਸੰਭਾਲੋ ਅਤੇ ਪ੍ਰਿੰਟ ਕਰੋ',
    staffLoginTitle: 'ਕਲੀਨਿਕ ਸਟਾਫ ਪ੍ਰਮਾਣੀਕਰਨ',
    enterPin: 'ਸੁਰੱਖਿਆ ਪਿੰਨ ਦਰਜ ਕਰੋ',
    selectRole: 'ਭੂਮਿਕਾ ਚੁਣੋ',
    receptionRole: 'ਰਿਸੈਪਸ਼ਨਿਸਟ',
    doctorRole: 'ਮਾਹਿਰ ਡਾਕਟਰ',
    signIn: 'ਲੌਗਇਨ ਕਰੋ',
    demoPinHint: 'ਸਟਾਫ ਪਿੰਨ: 1234',
  },
};

const BASE_URL = '/api';

export const ClinicProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [patients, setPatients] = useState([]);
  const [publicQueue, setPublicQueue] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);

  // Authenticated Staff Profile & JWT Token
  const [staffUser, setStaffUser] = useState(() => {
    try {
      const saved = localStorage.getItem('meditrack_staff');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const t = translations[language] || translations.en;

  // Auto-dismiss alert notifications
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Handle Token Expiry & Automatic Sign-out
  const handleAuthExpiry = useCallback(() => {
    setStaffUser(null);
    localStorage.removeItem('meditrack_staff');
    setError('Your session has expired or is invalid. Please sign in again.');
  }, []);

  // Fetch Public Live Queue (No auth, privacy-preserving)
  const fetchPublicQueue = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/patients/public-queue`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setPublicQueue(result.data);
        }
      }
    } catch (err) {
      console.warn('Public queue fetch warning:', err.message);
    }
  }, []);

  // Fetch Full Patients Roster (Staff JWT Protected)
  const fetchPatients = useCallback(async () => {
    if (!staffUser || !staffUser.token) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/patients`, {
        headers: {
          'Authorization': `Bearer ${staffUser.token}`,
        },
      });

      if (response.status === 401) {
        handleAuthExpiry();
        return;
      }

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setPatients(result.data);
      }
    } catch (err) {
      console.error('[Requirement 5: Frontend Error Handling]', err);
      setError(err.message || 'Error fetching staff patient list.');
    } finally {
      setLoading(false);
    }
  }, [staffUser, handleAuthExpiry]);

  // Fetch Prescriptions (Staff JWT Protected)
  const fetchPrescriptions = useCallback(async () => {
    if (!staffUser || !staffUser.token) {
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/prescriptions`, {
        headers: {
          'Authorization': `Bearer ${staffUser.token}`,
        },
      });

      if (response.status === 401) {
        handleAuthExpiry();
        return;
      }

      if (response.ok) {
        const result = await response.json();
        if (result.success) setPrescriptions(result.data);
      }
    } catch (err) {
      console.warn('Prescriptions fetch warning:', err.message);
    }
  }, [staffUser, handleAuthExpiry]);

  // Fetch System Diagnostics
  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/status`);
      if (response.ok) {
        const result = await response.json();
        setSystemStatus(result);
      }
    } catch {
      // Ignored for offline tolerance
    }
  }, []);

  // Periodic Synchronization
  useEffect(() => {
    fetchPublicQueue();
    fetchStatus();

    if (staffUser && staffUser.token) {
      fetchPatients();
      fetchPrescriptions();
    }

    const interval = setInterval(() => {
      fetchPublicQueue();
      if (staffUser && staffUser.token) {
        fetchPatients();
      }
    }, 12000);

    return () => clearInterval(interval);
  }, [staffUser, fetchPublicQueue, fetchPatients, fetchPrescriptions, fetchStatus]);

  // Book Patient / Generate Smart Token (Public or Reception)
  const bookPatient = async (patientFormData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BASE_URL}/patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientFormData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Registration failed');
      }

      setSuccessMessage(result.message);
      await fetchPublicQueue();
      if (staffUser && staffUser.token) {
        await fetchPatients();
      }
      return { success: true, data: result.data, triage: result.triage };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Update Patient Status (Staff Protected)
  const updatePatientStatus = async (patientId, newStatus) => {
    if (!staffUser || !staffUser.token) {
      setError('Staff login required to change patient status.');
      return false;
    }

    setError(null);
    try {
      const response = await fetch(`${BASE_URL}/patients/${patientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${staffUser.token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.status === 401) {
        handleAuthExpiry();
        return false;
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to update status');
      }

      setSuccessMessage(result.message);
      await fetchPatients();
      await fetchPublicQueue();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  // Delete Patient Record (Reception Staff Only)
  const deletePatient = async (patientId) => {
    if (!staffUser || !staffUser.token) {
      setError('Staff login required.');
      return false;
    }

    if (!window.confirm('Are you sure you want to delete this patient record?')) {
      return false;
    }

    setError(null);
    try {
      const response = await fetch(`${BASE_URL}/patients/${patientId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${staffUser.token}`,
        },
      });

      if (response.status === 401) {
        handleAuthExpiry();
        return false;
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to delete record');
      }

      setSuccessMessage('Patient record successfully removed.');
      await fetchPatients();
      await fetchPublicQueue();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  // Save Digital Prescription (Doctor Only)
  const savePrescription = async (prescriptionData) => {
    if (!staffUser || !staffUser.token) {
      setError('Doctor authentication required.');
      return { success: false, message: 'Authentication required' };
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BASE_URL}/prescriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${staffUser.token}`,
        },
        body: JSON.stringify(prescriptionData),
      });

      if (response.status === 401) {
        handleAuthExpiry();
        return { success: false, message: 'Session expired' };
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to save prescription');
      }

      setSuccessMessage(result.message);
      await fetchPatients();
      await fetchPublicQueue();
      await fetchPrescriptions();
      return { success: true, data: result.data };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Staff Login (Real JWT & Bcrypt Verification)
  const loginStaff = async (pin, role) => {
    setError(null);
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pin, role }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Authentication failed');
      }

      const userData = {
        id: result.user.id,
        role: result.user.role,
        name: result.user.name,
        username: result.user.username,
        token: result.token,
      };

      setStaffUser(userData);
      localStorage.setItem('meditrack_staff', JSON.stringify(userData));
      setSuccessMessage(`Welcome back, ${userData.name}!`);
      return { success: true, user: userData };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logoutStaff = () => {
    setStaffUser(null);
    localStorage.removeItem('meditrack_staff');
    setSuccessMessage('Signed out successfully.');
  };

  // Derived KPI Statistics
  const stats = useMemo(() => {
    const listToCount = staffUser ? patients : publicQueue;
    const waitingList = listToCount.filter((p) => p.status === 'Waiting');
    const inConsultationList = listToCount.filter((p) => p.status === 'In-Consultation');
    const completedList = listToCount.filter((p) => p.status === 'Completed');
    const highPriorityList = waitingList.filter((p) => p.priority === 'High');

    const estimatedWaitTimeMinutes = waitingList.length * 10;

    return {
      totalWaiting: waitingList.length,
      highPriorityCount: highPriorityList.length,
      inConsultationCount: inConsultationList.length,
      completedToday: completedList.length,
      estimatedWaitTimeMinutes,
    };
  }, [staffUser, patients, publicQueue]);

  return (
    <ClinicContext.Provider
      value={{
        patients: staffUser ? patients : publicQueue,
        publicQueue,
        prescriptions,
        loading,
        error,
        setError,
        successMessage,
        setSuccessMessage,
        systemStatus,
        staffUser,
        language,
        setLanguage,
        t,
        stats,
        fetchPatients,
        fetchPublicQueue,
        bookPatient,
        updatePatientStatus,
        deletePatient,
        savePrescription,
        loginStaff,
        logoutStaff,
      }}
    >
      {children}
    </ClinicContext.Provider>
  );
};

export const useClinic = () => {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error('useClinic must be used within a ClinicProvider');
  }
  return context;
};
