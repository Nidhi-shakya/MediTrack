import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { io } from 'socket.io-client';

export const ClinicContext = createContext();

const translations = {
  en: {
    brand: 'MediTrack',
    subBrand: 'Smart Outpatient Queue & Digital Prescription',
    navBook: 'Book Token',
    navQueue: 'Live Queue Board',
    navReception: 'Reception Desk',
    navDoctor: 'Doctor Portal',
    navReminders: 'Medicine Reminder',
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
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [notificationPermission, setNotificationPermission] = useState(() => {
    return typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'default';
  });

  const [staffUser, setStaffUser] = useState(() => {
    try {
      const saved = localStorage.getItem('meditrack_staff');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const t = translations[language] || translations.en;

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

  const handleAuthExpiry = useCallback(() => {
    setStaffUser(null);
    localStorage.removeItem('meditrack_staff');
    setError('Your session has expired. Please sign in again.');
  }, []);

  const request = useCallback(
    async (path, method = 'GET', body = null, needAuth = false) => {
      const headers = { 'Content-Type': 'application/json' };
      if (needAuth && staffUser?.token) {
        headers['Authorization'] = `Bearer ${staffUser.token}`;
      }

      const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null,
      });

      if (res.status === 401 && needAuth) {
        handleAuthExpiry();
        throw new Error('Unauthorized');
      }

      const json = await res.json();
      if (!res.ok || json.success === false) {
        throw new Error(json.message || json.error || 'Request failed');
      }
      return json;
    },
    [staffUser, handleAuthExpiry]
  );

  const fetchPublicQueue = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/patients/public-queue`);
      const json = await res.json();
      if (json.success) setPublicQueue(json.data);
    } catch (err) {
      console.warn('Queue fetch:', err.message);
    }
  }, []);

  const fetchPatients = useCallback(async () => {
    if (!staffUser?.token) return;
    try {
      const json = await request('/patients', 'GET', null, true);
      if (json.success) setPatients(json.data);
    } catch (err) {
      if (err.message !== 'Unauthorized') setError(err.message);
    }
  }, [staffUser, request]);

  const fetchPrescriptions = useCallback(async () => {
    if (!staffUser?.token) return;
    try {
      const json = await request('/prescriptions', 'GET', null, true);
      if (json.success) setPrescriptions(json.data);
    } catch {
    }
  }, [staffUser, request]);

  const fetchMedications = useCallback(async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      const q = params.toString() ? `?${params.toString()}` : '';
      const res = await fetch(`${BASE_URL}/medications${q}`);
      const json = await res.json();
      if (json.success) setMedications(json.data);
    } catch (err) {
      console.warn('Medications fetch:', err.message);
    }
  }, []);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/status`);
      const json = await res.json();
      setSystemStatus(json);
    } catch {
    }
  }, []);

  useEffect(() => {
    fetchPublicQueue();
    fetchStatus();
    fetchMedications();

    if (staffUser?.token) {
      fetchPatients();
      fetchPrescriptions();
    }

    let socket = null;
    try {
      socket = io(window.location.origin, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
      });

      socket.on('queue:updated', () => {
        fetchPublicQueue();
        if (staffUser?.token) {
          fetchPatients();
          fetchPrescriptions();
        }
      });
    } catch (e) {
      console.warn('Socket note:', e.message);
    }

    const interval = setInterval(() => {
      fetchPublicQueue();
      if (staffUser?.token) fetchPatients();
    }, 15000);

    return () => {
      clearInterval(interval);
      if (socket) socket.disconnect();
    };
  }, [staffUser, fetchPublicQueue, fetchPatients, fetchPrescriptions, fetchMedications, fetchStatus]);

  useEffect(() => {
    const notified = new Set();
    const interval = setInterval(() => {
      if (!medications.length) return;
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const dateStr = now.toISOString().split('T')[0];

      medications.forEach((med) => {
        if (med.status !== 'active') return;
        if (!Array.isArray(med.times) || !med.times.includes(timeStr)) return;

        const key = `${med._id}_${dateStr}_${timeStr}`;
        if (notified.has(key)) return;

        const alreadyLogged = Array.isArray(med.logs) && med.logs.some((l) => l.date === dateStr && l.time === timeStr);
        if (alreadyLogged) return;

        notified.add(key);

        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          new Notification(`Medicine Reminder: ${med.name}`, {
            body: `Scheduled: ${med.dosage} (${med.instructions || 'Take as advised'})`,
            icon: '/favicon.ico',
          });
        }
        setSuccessMessage(`🔔 Reminder: Time to take ${med.name} (${med.dosage})`);
      });
    }, 20000);

    return () => clearInterval(interval);
  }, [medications]);

  const bookPatient = async (formData) => {
    setLoading(true);
    try {
      const res = await request('/patients', 'POST', formData, false);
      setSuccessMessage(res.message);
      await fetchPublicQueue();
      if (staffUser?.token) await fetchPatients();
      return { success: true, data: res.data, triage: res.triage };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updatePatientStatus = async (id, status) => {
    try {
      const res = await request(`/patients/${id}`, 'PUT', { status }, true);
      setSuccessMessage(res.message);
      await fetchPatients();
      await fetchPublicQueue();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const deletePatient = async (id) => {
    if (!window.confirm('Are you sure you want to delete this patient record?')) return false;
    try {
      await request(`/patients/${id}`, 'DELETE', null, true);
      setSuccessMessage('Patient record successfully removed.');
      await fetchPatients();
      await fetchPublicQueue();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const callNextPatient = async () => {
    setLoading(true);
    try {
      const res = await request('/patients/call-next', 'POST', {}, true);
      setSuccessMessage(res.message);
      await fetchPatients();
      await fetchPublicQueue();
      return { success: true, patient: res.data };
    } catch (err) {
      setError(err.message || 'No patients currently waiting.');
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const savePrescription = async (data) => {
    setLoading(true);
    try {
      const res = await request('/prescriptions', 'POST', data, true);
      setSuccessMessage(res.message);
      await fetchPatients();
      await fetchPublicQueue();
      await fetchPrescriptions();
      return { success: true, data: res.data };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const fetchPrescriptionHistory = async (patientId) => {
    if (!patientId || !staffUser?.token) return [];
    try {
      const res = await request(`/prescriptions/patient/${patientId}`, 'GET', null, true);
      return res.data || [];
    } catch {
      return [];
    }
  };

  const loginStaff = async (pin, role) => {
    setLoading(true);
    try {
      const res = await request('/auth/login', 'POST', { pin, role }, false);
      const user = {
        id: res.user.id,
        role: res.user.role,
        name: res.user.name,
        username: res.user.username,
        token: res.token,
      };
      setStaffUser(user);
      localStorage.setItem('meditrack_staff', JSON.stringify(user));
      setSuccessMessage(`Welcome back, ${user.name}!`);
      return { success: true, user };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logoutStaff = () => {
    setStaffUser(null);
    localStorage.removeItem('meditrack_staff');
    setSuccessMessage('Signed out successfully.');
  };

  const addMedication = async (data) => {
    try {
      const res = await request('/medications', 'POST', data, false);
      setSuccessMessage('Medication schedule added successfully.');
      await fetchMedications();
      return { success: true, data: res.data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const updateMedication = async (id, data) => {
    try {
      const res = await request(`/medications/${id}`, 'PUT', data, false);
      setSuccessMessage('Medication updated successfully.');
      await fetchMedications();
      return { success: true, data: res.data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const deleteMedication = async (id) => {
    try {
      await request(`/medications/${id}`, 'DELETE', null, false);
      setSuccessMessage('Medication removed from reminder schedule.');
      await fetchMedications();
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const logMedicationDose = async (id, doseInfo) => {
    try {
      const res = await request(`/medications/${id}/dose`, 'POST', doseInfo, false);
      setSuccessMessage(`Dose marked as ${doseInfo.status}.`);
      await fetchMedications();
      return { success: true, data: res.data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      setNotificationPermission(perm);
      if (perm === 'granted') {
        setSuccessMessage('Browser notifications enabled.');
      }
      return perm;
    }
    return 'denied';
  };

  const stats = useMemo(() => {
    const list = staffUser ? patients : publicQueue;
    const waiting = list.filter((p) => p.status === 'Waiting');
    const inConsult = list.filter((p) => p.status === 'In-Consultation');
    const completed = list.filter((p) => p.status === 'Completed');
    const high = waiting.filter((p) => p.priority === 'High');

    return {
      totalWaiting: waiting.length,
      waitingCount: waiting.length,
      highPriorityCount: high.length,
      emergencyCount: high.length,
      inConsultationCount: inConsult.length,
      completedToday: completed.length,
      estimatedWaitTimeMinutes: waiting.length * 10,
    };
  }, [staffUser, patients, publicQueue]);

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
        medications,
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
        fetchMedications,
        bookPatient,
        updatePatientStatus,
        deletePatient,
        callNextPatient,
        savePrescription,
        fetchPrescriptionHistory,
        loginStaff,
        logoutStaff,
        addMedication,
        updateMedication,
        deleteMedication,
        logMedicationDose,
        notificationPermission,
        requestNotificationPermission,
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
