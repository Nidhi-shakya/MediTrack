// [Requirement 10: Hooks & Context API]
// [Requirement 4: Fetch API]
// [Requirement 5: Error Handling]
// frontend/src/context/ClinicContext.jsx

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

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
    triageExplanation: 'Automated Smart Triage evaluates age, vitals & symptoms to prioritize urgent patients.',
    prescriptionPad: 'Digital Prescription Pad',
    diagnosis: 'Diagnosis / Assessment',
    medicine: 'Medicine Name',
    dosage: 'Dosage (e.g. 1-0-1)',
    duration: 'Duration',
    addMedicine: '+ Add Another Medicine',
    clinicalNotes: 'Special Advice / Doctor Notes',
    saveAndPrint: 'Save & Print Digital Prescription',
    staffLoginTitle: 'Clinic Staff Authentication',
    enterPin: 'Enter 4-Digit Security PIN',
    selectRole: 'Select Staff Role',
    receptionRole: 'Receptionist / Front Desk',
    doctorRole: 'Consulting Physician / Doctor',
    signIn: 'Verify PIN & Sign In',
    demoPinHint: 'Evaluation Demo PIN: 1234',
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
    triageExplanation: 'स्मार्ट ट्रायज इंजन आयु, बुखार और लक्षणों के आधार पर प्राथमिकता तय करता है।',
    prescriptionPad: 'डिजिटल डॉक्टर पर्चा',
    diagnosis: 'रोग निदान (Diagnosis)',
    medicine: 'दवा का नाम',
    dosage: 'खुराक (उदा. 1-0-1)',
    duration: 'अवधि',
    addMedicine: '+ नई दवा जोड़ें',
    clinicalNotes: 'विशेष परामर्श / निर्देश',
    saveAndPrint: 'पर्चा सहेजें और प्रिंट करें',
    staffLoginTitle: 'क्लिनिक स्टाफ प्रमाणीकरण',
    enterPin: '4-अंकों का सुरक्षा पिन दर्ज करें',
    selectRole: 'स्टाफ पद चुनें',
    receptionRole: 'रिसेप्शनिस्ट / फ्रंट डेस्क',
    doctorRole: 'चिकित्सक / डॉक्टर',
    signIn: 'पिन सत्यापित करें एवं लॉगिन करें',
    demoPinHint: 'डेमो पिन: 1234',
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
    triageExplanation: 'ਸਮਾਰਟ ਟ੍ਰਾਈਏਜ ਉਮਰ ਅਤੇ ਲੱਛਣਾਂ ਅਨੁਸਾਰ ਤਰਜੀਹ ਤੈਅ ਕਰਦਾ ਹੈ।',
    prescriptionPad: 'ਡਿਜੀਟਲ ਡਾਕਟਰੀ ਪਰਚੀ',
    diagnosis: 'ਬਿਮਾਰੀ ਦੀ ਜਾਂਚ',
    medicine: 'ਦਵਾਈ ਦਾ ਨਾਮ',
    dosage: 'ਖੁਰਾਕ (ਜਿਵੇਂ 1-0-1)',
    duration: 'ਮਿਆਦ',
    addMedicine: '+ ਹੋਰ ਦਵਾਈ ਸ਼ਾਮਲ ਕਰੋ',
    clinicalNotes: 'ਵਿਸ਼ੇਸ਼ ਸਲਾਹ / ਨੋਟਸ',
    saveAndPrint: 'ਪਰਚੀ ਸੰਭਾਲੋ ਅਤੇ ਪ੍ਰਿੰਟ ਕਰੋ',
    staffLoginTitle: 'ਕਲੀਨਿਕ ਸਟਾਫ ਪ੍ਰਮਾਣੀਕਰਨ',
    enterPin: '4-ਅੰਕਾਂ ਦਾ ਸੁਰੱਖਿਆ ਪਿੰਨ ਦਰਜ ਕਰੋ',
    selectRole: 'ਭੂਮਿਕਾ ਚੁਣੋ',
    receptionRole: 'ਰਿਸੈਪਸ਼ਨਿਸਟ',
    doctorRole: 'ਮਾਹਿਰ ਡਾਕਟਰ',
    signIn: 'ਲੌਗਇਨ ਕਰੋ',
    demoPinHint: 'ਡੈਮੋ ਪਿੰਨ: 1234',
  },
};

// Robust API endpoint resolution: prefers relative /api for Vite proxy and production
const BASE_URL = '/api';

export const ClinicProvider = ({ children }) => {
  // [Requirement 10: State Hooks]
  const [language, setLanguage] = useState('en');
  const [patients, setPatients] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [staffUser, setStaffUser] = useState(() => {
    const saved = localStorage.getItem('meditrack_staff');
    return saved ? JSON.parse(saved) : null;
  });

  // Multilingual helper string lookup
  const t = translations[language] || translations.en;

  // Auto-dismiss banners after 5 seconds
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

  // [Requirement 4: Fetch API with async/await and native fetch()]
  // [Requirement 5: try/catch Error Handling]
  const fetchPatients = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BASE_URL}/patients`);
      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}: Failed to fetch patients`);
      }
      const result = await response.json();
      if (result.success) {
        setPatients(result.data);
      } else {
        throw new Error(result.message || 'Unable to retrieve patient queue');
      }
    } catch (err) {
      console.error('[Requirement 5: Frontend Error Handling]', err);
      setError(err.message || 'Network connection error while reaching MediTrack server');
    } finally {
      setLoading(false);
    }
  };

  const fetchPrescriptions = async () => {
    try {
      const response = await fetch(`${BASE_URL}/prescriptions`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) setPrescriptions(result.data);
      }
    } catch (err) {
      console.warn('Prescriptions fetch warning:', err.message);
    }
  };

  // Initial load and periodic synchronization every 12 seconds
  useEffect(() => {
    fetchPatients();
    fetchPrescriptions();

    const interval = setInterval(() => {
      fetchPatients();
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  // [Requirement 4: Fetch API - Register Patient (POST)]
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
      // Immediately refresh list
      await fetchPatients();
      return { success: true, data: result.data };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  // [Requirement 4: Fetch API - Update Patient Status (PUT)]
  const updatePatientStatus = async (patientId, newStatus) => {
    setError(null);
    try {
      const response = await fetch(`${BASE_URL}/patients/${patientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to update status');
      }

      setSuccessMessage(result.message);
      await fetchPatients();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  // [Requirement 4: Fetch API - Delete Patient Record (DELETE)]
  const deletePatient = async (patientId) => {
    if (!window.confirm('Are you sure you want to delete this patient record from the queue?')) {
      return false;
    }

    setError(null);
    try {
      const response = await fetch(`${BASE_URL}/patients/${patientId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to delete record');
      }

      setSuccessMessage('Patient record successfully removed.');
      await fetchPatients();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  // [Requirement 4: Fetch API - Save Digital Prescription (POST)]
  const savePrescription = async (prescriptionData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BASE_URL}/prescriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(prescriptionData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to save prescription');
      }

      setSuccessMessage(result.message);
      await fetchPatients();
      await fetchPrescriptions();
      return { success: true, data: result.data };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  // [Requirement 4: Fetch API - Staff Login Authentication]
  const loginStaff = async (pin, role) => {
    setError(null);
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
        role: result.user.role,
        name: result.user.name,
        token: result.token,
      };

      setStaffUser(userData);
      localStorage.setItem('meditrack_staff', JSON.stringify(userData));
      setSuccessMessage(`Welcome back, ${userData.name}!`);
      return { success: true, user: userData };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  // Staff Logout
  const logoutStaff = () => {
    setStaffUser(null);
    localStorage.removeItem('meditrack_staff');
    setSuccessMessage('Signed out successfully.');
  };

  // [Requirement 10: useMemo for Performance & Derived KPI Statistics]
  const stats = useMemo(() => {
    const waitingList = patients.filter((p) => p.status === 'Waiting');
    const inConsultationList = patients.filter((p) => p.status === 'In-Consultation');
    const completedList = patients.filter((p) => p.status === 'Completed');
    const highPriorityList = waitingList.filter((p) => p.priority === 'High');

    // Live estimated wait time: (Waiting count) * 10 mins
    const estimatedWaitTimeMinutes = waitingList.length * 10;

    return {
      totalWaiting: waitingList.length,
      highPriorityCount: highPriorityList.length,
      inConsultationCount: inConsultationList.length,
      completedToday: completedList.length,
      estimatedWaitTimeMinutes,
    };
  }, [patients]);

  return (
    <ClinicContext.Provider
      value={{
        patients,
        prescriptions,
        loading,
        error,
        setError,
        successMessage,
        setSuccessMessage,
        staffUser,
        language,
        setLanguage,
        t,
        stats,
        fetchPatients,
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

// Custom Hook for clean context consumption
export const useClinic = () => {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error('useClinic must be used within a ClinicProvider');
  }
  return context;
};

