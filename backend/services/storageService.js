const bcrypt = require('bcryptjs');
const Patient = require('../models/Patient');
const Prescription = require('../models/Prescription');
const Staff = require('../models/Staff');
const { getDatabaseStatus } = require('../config/db');

const DEFAULT_HASH_1234 = bcrypt.hashSync('1234', 10);

const initialStaff = [
  {
    _id: 'staff_rec_01',
    username: 'reception',
    name: 'Front Desk Receptionist (Counter 1)',
    role: 'reception',
    passwordHash: process.env.RECEPTION_PIN
      ? bcrypt.hashSync(process.env.RECEPTION_PIN, 10)
      : DEFAULT_HASH_1234,
    isActive: true,
  },
  {
    _id: 'staff_doc_01',
    username: 'doctor',
    name: 'Dr. A. Verma (MBBS, MD - General Medicine)',
    role: 'doctor',
    passwordHash: process.env.DOCTOR_PIN
      ? bcrypt.hashSync(process.env.DOCTOR_PIN, 10)
      : DEFAULT_HASH_1234,
    isActive: true,
  },
];

const initialPatients = [
  {
    _id: '65f1a101b1c2d3e4f5a00101',
    tokenNumber: 'T-101',
    name: 'Ramesh Sharma',
    age: 68,
    gender: 'Male',
    phone: '9876543210',
    symptoms: 'Severe Chest Pain, Radiating to Left Arm, Breathing Difficulty',
    temperature: 102.4,
    priority: 'High',
    riskScore: 85,
    status: 'Waiting',
    prescription: null,
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    _id: '65f1a101b1c2d3e4f5a00102',
    tokenNumber: 'T-102',
    name: 'Sunita Patel',
    age: 54,
    gender: 'Female',
    phone: '9823456789',
    symptoms: 'High Fever, Chills, Body Aches for 3 Days',
    temperature: 100.8,
    priority: 'Medium',
    riskScore: 50,
    status: 'Waiting',
    prescription: null,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    _id: '65f1a101b1c2d3e4f5a00103',
    tokenNumber: 'T-103',
    name: 'Priya Kaur',
    age: 32,
    gender: 'Female',
    phone: '9899001122',
    symptoms: 'Routine Antenatal Blood Pressure & Vitamin Review',
    temperature: 98.6,
    priority: 'Normal',
    riskScore: 15,
    status: 'In-Consultation',
    prescription: null,
    createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
  },
  {
    _id: '65f1a101b1c2d3e4f5a00104',
    tokenNumber: 'T-104',
    name: 'Vikram Singh',
    age: 28,
    gender: 'Male',
    phone: '9811223344',
    symptoms: 'Twisted Right Ankle while playing badminton, localized swelling',
    temperature: 98.4,
    priority: 'Normal',
    riskScore: 15,
    status: 'Waiting',
    prescription: null,
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
];

let inMemoryPatients = JSON.parse(JSON.stringify(initialPatients));
let inMemoryPrescriptions = [];
let inMemoryStaff = JSON.parse(JSON.stringify(initialStaff));

let ioInstance = null;

const setSocketIO = (io) => {
  ioInstance = io;
};

const broadcastQueueUpdate = (action, data = null) => {
  if (ioInstance) {
    try {
      ioInstance.emit('queue:updated', {
        action,
        data,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Socket.IO broadcast warning:', err.message);
    }
  }
};

const maskPatientName = (fullName) => {
  if (!fullName) return 'Patient';
  const parts = fullName.trim().split(' ');
  if (parts.length === 1) return parts[0];
  const firstName = parts[0];
  const lastInitial = parts[parts.length - 1][0] || '';
  return `${firstName} ${lastInitial}.`;
};

const generateNextTokenNumber = async () => {
  let existingTokens = [];
  const dbStatus = getDatabaseStatus();

  if (dbStatus.isConnected) {
    const list = await Patient.find({}, 'tokenNumber').lean();
    existingTokens = list.map((p) => p.tokenNumber);
  } else {
    existingTokens = inMemoryPatients.map((p) => p.tokenNumber);
  }

  const numbers = existingTokens
    .map((t) => {
      const match = (t || '').match(/\d+/);
      return match ? parseInt(match[0], 10) : 100;
    })
    .filter((n) => !isNaN(n));

  const maxNum = numbers.length > 0 ? Math.max(...numbers) : 100;
  return `T-${maxNum + 1}`;
};

const sortQueue = (patients) => {
  const priorityWeight = { High: 3, Medium: 2, Normal: 1 };

  return [...patients].sort((a, b) => {
    if (a.status === 'In-Consultation' && b.status !== 'In-Consultation') return -1;
    if (b.status === 'In-Consultation' && a.status !== 'In-Consultation') return 1;

    if (a.status === 'Waiting' && b.status === 'Completed') return -1;
    if (b.status === 'Waiting' && a.status === 'Completed') return 1;

    if (a.status === 'Waiting' && b.status === 'Waiting') {
      const weightA = priorityWeight[a.priority] || 1;
      const weightB = priorityWeight[b.priority] || 1;
      if (weightB !== weightA) return weightB - weightA;
      return new Date(a.createdAt) - new Date(b.createdAt);
    }

    return new Date(b.createdAt) - new Date(a.createdAt);
  });
};

module.exports = {
  setSocketIO,
  broadcastQueueUpdate,

  getPatients: async (filterOptions = {}) => {
    const { search, status, page, limit } = filterOptions;
    const dbStatus = getDatabaseStatus();
    let list = [];

    if (dbStatus.isConnected) {
      const query = {};
      if (status) query.status = status;
      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        query.$or = [{ name: regex }, { tokenNumber: regex }, { phone: regex }];
      }
      list = await Patient.find(query).populate('prescription').lean();
    } else {
      list = inMemoryPatients;
      if (status) {
        list = list.filter((p) => p.status === status);
      }
      if (search && search.trim()) {
        const queryTerm = search.trim().toLowerCase();
        list = list.filter(
          (p) =>
            (p.name && p.name.toLowerCase().includes(queryTerm)) ||
            (p.tokenNumber && p.tokenNumber.toLowerCase().includes(queryTerm)) ||
            (p.phone && p.phone.includes(queryTerm))
        );
      }
    }

    const sorted = sortQueue(list);

    if (page && limit) {
      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.max(1, parseInt(limit, 10));
      const startIndex = (pageNum - 1) * limitNum;
      const paginatedItems = sorted.slice(startIndex, startIndex + limitNum);

      return {
        data: paginatedItems,
        pagination: {
          total: sorted.length,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(sorted.length / limitNum),
        },
      };
    }

    return sorted;
  },

  getPatientById: async (id) => {
    const dbStatus = getDatabaseStatus();
    if (dbStatus.isConnected) {
      return Patient.findById(id).populate('prescription');
    }
    return inMemoryPatients.find((p) => String(p._id) === String(id)) || null;
  },

  createPatient: async (patientData) => {
    const tokenNumber = await generateNextTokenNumber();
    const dbStatus = getDatabaseStatus();
    let saved;

    if (dbStatus.isConnected) {
      const newPatient = new Patient({
        ...patientData,
        tokenNumber,
        status: 'Waiting',
      });
      saved = await newPatient.save();
    } else {
      saved = {
        _id: 'mem_' + Date.now() + Math.random().toString(36).substr(2, 4),
        ...patientData,
        tokenNumber,
        status: 'Waiting',
        prescription: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      inMemoryPatients.push(saved);
    }

    broadcastQueueUpdate('PATIENT_REGISTERED', saved);
    return saved;
  },

  updatePatient: async (id, updateFields) => {
    const dbStatus = getDatabaseStatus();
    let updated = null;

    if (dbStatus.isConnected) {
      updated = await Patient.findByIdAndUpdate(id, updateFields, { new: true });
    } else {
      const idx = inMemoryPatients.findIndex((p) => String(p._id) === String(id));
      if (idx !== -1) {
        inMemoryPatients[idx] = {
          ...inMemoryPatients[idx],
          ...updateFields,
          updatedAt: new Date().toISOString(),
        };
        updated = inMemoryPatients[idx];
      }
    }

    if (updated) {
      broadcastQueueUpdate('PATIENT_UPDATED', updated);
    }
    return updated;
  },

  callNextPatient: async () => {
    const dbStatus = getDatabaseStatus();
    let nextPatient = null;

    if (dbStatus.isConnected) {
      const waiting = await Patient.find({ status: 'Waiting' }).lean();
      if (!waiting || waiting.length === 0) return null;
      const sorted = sortQueue(waiting);
      nextPatient = sorted[0];

      if (nextPatient) {
        const updated = await Patient.findByIdAndUpdate(
          nextPatient._id,
          { status: 'In-Consultation' },
          { new: true }
        );
        broadcastQueueUpdate('CALL_NEXT', updated);
        return updated;
      }
    } else {
      const waiting = inMemoryPatients.filter((p) => p.status === 'Waiting');
      if (waiting.length === 0) return null;
      const sorted = sortQueue(waiting);
      nextPatient = sorted[0];

      if (nextPatient) {
        const idx = inMemoryPatients.findIndex((p) => String(p._id) === String(nextPatient._id));
        if (idx !== -1) {
          inMemoryPatients[idx].status = 'In-Consultation';
          inMemoryPatients[idx].updatedAt = new Date().toISOString();
          nextPatient = inMemoryPatients[idx];
          broadcastQueueUpdate('CALL_NEXT', nextPatient);
          return nextPatient;
        }
      }
    }

    return null;
  },

  deletePatient: async (id) => {
    const dbStatus = getDatabaseStatus();
    let success = false;

    if (dbStatus.isConnected) {
      const res = await Patient.findByIdAndDelete(id);
      success = !!res;
    } else {
      const initialLen = inMemoryPatients.length;
      inMemoryPatients = inMemoryPatients.filter((p) => String(p._id) !== String(id));
      success = inMemoryPatients.length < initialLen;
    }

    if (success) {
      broadcastQueueUpdate('PATIENT_DELETED', { id });
    }
    return success;
  },

  createPrescription: async (prescriptionData) => {
    const dbStatus = getDatabaseStatus();
    let savedRx = null;

    if (dbStatus.isConnected) {
      const newRx = new Prescription(prescriptionData);
      savedRx = await newRx.save();

      await Patient.findByIdAndUpdate(prescriptionData.patientId, {
        status: 'Completed',
        prescription: savedRx._id,
      });
    } else {
      savedRx = {
        _id: 'rx_' + Date.now(),
        ...prescriptionData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      inMemoryPrescriptions.push(savedRx);

      const idx = inMemoryPatients.findIndex(
        (p) => String(p._id) === String(prescriptionData.patientId)
      );
      if (idx !== -1) {
        inMemoryPatients[idx].status = 'Completed';
        inMemoryPatients[idx].prescription = savedRx;
        inMemoryPatients[idx].updatedAt = new Date().toISOString();
      }
    }

    broadcastQueueUpdate('PRESCRIPTION_CREATED', savedRx);
    return savedRx;
  },

  getPrescriptions: async () => {
    const dbStatus = getDatabaseStatus();
    if (dbStatus.isConnected) {
      return Prescription.find().sort({ createdAt: -1 }).lean();
    }
    return [...inMemoryPrescriptions].reverse();
  },

  getPrescriptionsByPatientId: async (patientId) => {
    const dbStatus = getDatabaseStatus();
    if (dbStatus.isConnected) {
      return Prescription.find({ patientId }).sort({ createdAt: -1 }).lean();
    }
    return inMemoryPrescriptions
      .filter((p) => String(p.patientId) === String(patientId))
      .reverse();
  },

  findStaffByUsername: async (username) => {
    const dbStatus = getDatabaseStatus();
    const cleanUser = String(username).toLowerCase().trim();

    if (dbStatus.isConnected) {
      return Staff.findOne({ username: cleanUser, isActive: true });
    }
    return inMemoryStaff.find((s) => s.username === cleanUser && s.isActive) || null;
  },

  findStaffByRole: async (role) => {
    const dbStatus = getDatabaseStatus();
    const cleanRole = String(role).toLowerCase().trim();

    if (dbStatus.isConnected) {
      return Staff.findOne({ role: cleanRole, isActive: true });
    }
    return inMemoryStaff.find((s) => s.role === cleanRole && s.isActive) || null;
  },

  maskPatientName,
  resetMemoryStoreForTesting: () => {
    inMemoryPatients = JSON.parse(JSON.stringify(initialPatients));
    inMemoryPrescriptions = [];
    inMemoryStaff = JSON.parse(JSON.stringify(initialStaff));
  },
};

