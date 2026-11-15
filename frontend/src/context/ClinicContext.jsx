// ==============================================================================
// MediTrack Clinic Context & State Management
// [Requirement 1: Real JWT Handling, Expiry Interception, & Clean Session Storage]
// [Requirement 2 & 3: Role-Aware Queries & Public Queue Privacy Consumption]
// [Requirement 4: Pure Native Fetch API with Async/Await]
// [Requirement 5: Visible UI Alerts & Error Handling]
// [Requirement 10: Hooks & Context API with Multilingual Support]
// ==============================================================================

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { io } from 'socket.io-client';

export const ClinicContext = createContext();

// UI Dictionary: English
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
  const [searchQuery, setSearchQuery] = useState('');

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

  // Real-Time Socket.IO Synchronization (Phase 3: Smart Queue Management)
  useEffect(() => {
    let socket = null;
    try {
      socket = io(window.location.origin, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
      });

      socket.on('queue:updated', () => {
        fetchPublicQueue();
        if (staffUser && staffUser.token) {
          fetchPatients();
          fetchPrescriptions();
        }
      });
    } catch (e) {
      console.warn('Socket.IO connection notice:', e.message);
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, [staffUser, fetchPublicQueue, fetchPatients, fetchPrescriptions]);

  // Periodic Synchronization (Fallback Polling)
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
    }, 15000);

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

  // Call Next Patient (Phase 3: Priority Smart Queue Calling)
  const callNextPatient = async () => {
    if (!staffUser || !staffUser.token) {
      setError('Staff login required.');
      return { success: false, message: 'Authentication required' };
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BASE_URL}/patients/call-next`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${staffUser.token}`,
        },
      });

      if (response.status === 401) {
        handleAuthExpiry();
        return { success: false, message: 'Session expired' };
      }

      const result = await response.json();
      if (result.success && result.data) {
        setSuccessMessage(result.message);
        await fetchPatients();
        await fetchPublicQueue();
        return { success: true, patient: result.data };
      } else {
        setError(result.message || 'No patients currently waiting in queue.');
        return { success: false, message: result.message };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Fetch Patient Prescription History (Phase 4)
  const fetchPrescriptionHistory = async (patientId) => {
    if (!staffUser || !staffUser.token || !patientId) return [];
    try {
      const response = await fetch(`${BASE_URL}/prescriptions/patient/${patientId}`, {
        headers: {
          'Authorization': `Bearer ${staffUser.token}`,
        },
      });
      if (response.ok) {
        const result = await response.json();
        return result.data || [];
      }
    } catch (err) {
      console.warn('Prescription history lookup warning:', err.message);
    }
    return [];
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
      waitingCount: waitingList.length,
      highPriorityCount: highPriorityList.length,
      emergencyCount: highPriorityList.length,
      inConsultationCount: inConsultationList.length,
      completedToday: completedList.length,
      estimatedWaitTimeMinutes,
    };
  }, [staffUser, patients, publicQueue]);

  // Client-Side Search Filter for Dashboards (Phase 3 & 6)
  const filteredPatients = useMemo(() => {
    const list = staffUser ? patients : publicQueue;
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter(
      (p) =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.tokenNumber && p.tokenNumber.toLowerCase().includes(q)) ||
        (p.phone && p.phone.includes(q))
    );
  }, [staffUser, patients, publicQueue, searchQuery]);

  return (
    <ClinicContext.Provider
      value={{
        patients: staffUser ? patients : publicQueue,
        filteredPatients,
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
        searchQuery,
        setSearchQuery,
        t,
        stats,
        fetchPatients,
        fetchPublicQueue,
        bookPatient,
        updatePatientStatus,
        deletePatient,
        callNextPatient,
        savePrescription,
        fetchPrescriptionHistory,
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
