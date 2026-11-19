const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Patient = require('../models/Patient');
const Prescription = require('../models/Prescription');
const Staff = require('../models/Staff');
const Medication = require('../models/Medication');
const { getDatabaseStatus } = require('../config/db');

const DEFAULT_HASH = bcrypt.hashSync('1234', 10);

const initialStaff = [
  {
    _id: 'staff_rec_01',
    username: 'reception',
    name: 'Front Desk Receptionist (Counter 1)',
    role: 'reception',
    passwordHash: process.env.RECEPTION_PIN
      ? bcrypt.hashSync(process.env.RECEPTION_PIN, 10)
      : DEFAULT_HASH,
    isActive: true,
  },
  {
    _id: 'staff_doc_01',
    username: 'doctor',
    name: 'Dr. A. Verma (MBBS, MD - General Medicine)',
    role: 'doctor',
    passwordHash: process.env.DOCTOR_PIN
      ? bcrypt.hashSync(process.env.DOCTOR_PIN, 10)
      : DEFAULT_HASH,
    isActive: true,
  },
];

const now = Date.now();
const oneDay = 24 * 60 * 60 * 1000;

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
    createdAt: new Date(now - 45 * 60 * 1000).toISOString(),
    updatedAt: new Date(now - 45 * 60 * 1000).toISOString(),
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
    createdAt: new Date(now - 30 * 60 * 1000).toISOString(),
    updatedAt: new Date(now - 30 * 60 * 1000).toISOString(),
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
    createdAt: new Date(now - 20 * 60 * 1000).toISOString(),
    updatedAt: new Date(now - 20 * 60 * 1000).toISOString(),
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
    createdAt: new Date(now - 10 * 60 * 1000).toISOString(),
    updatedAt: new Date(now - 10 * 60 * 1000).toISOString(),
  },
];

const initialMedications = [
  {
    _id: '65f1b201a1b2c3d4e5f00201',
    name: 'Paracetamol',
    dosage: '500 mg',
    frequency: 'Twice Daily',
    times: ['08:00', '20:00'],
    startDate: new Date(now - 2 * oneDay).toISOString(),
    endDate: new Date(now + 3 * oneDay).toISOString(),
    instructions: 'Take 1 tablet after meals with water.',
    status: 'active',
    logs: [{ date: new Date().toISOString().split('T')[0], time: '08:00', status: 'Taken' }],
    createdAt: new Date(now - 2 * oneDay).toISOString(),
    updatedAt: new Date(now - 2 * oneDay).toISOString(),
  },
  {
    _id: '65f1b201a1b2c3d4e5f00202',
    name: 'Amoxicillin',
    dosage: '250 mg',
    frequency: 'Thrice Daily',
    times: ['08:00', '14:00', '20:00'],
    startDate: new Date(now - 1 * oneDay).toISOString(),
    endDate: new Date(now + 5 * oneDay).toISOString(),
    instructions: 'Complete full 5-day antibiotic course.',
    status: 'active',
    logs: [],
    createdAt: new Date(now - 1 * oneDay).toISOString(),
    updatedAt: new Date(now - 1 * oneDay).toISOString(),
  },
  {
    _id: '65f1b201a1b2c3d4e5f00203',
    name: 'Multivitamin & Zinc',
    dosage: '1 Capsule',
    frequency: 'Once Daily',
    times: ['09:00'],
    startDate: new Date(now - 5 * oneDay).toISOString(),
    endDate: new Date(now + 25 * oneDay).toISOString(),
    instructions: 'Take in morning with breakfast.',
    status: 'active',
    logs: [{ date: new Date().toISOString().split('T')[0], time: '09:00', status: 'Taken' }],
    createdAt: new Date(now - 5 * oneDay).toISOString(),
    updatedAt: new Date(now - 5 * oneDay).toISOString(),
  },
  {
    _id: '65f1b201a1b2c3d4e5f00204',
    name: 'Cetirizine',
    dosage: '10 mg',
    frequency: 'Once Daily',
    times: ['21:00'],
    startDate: new Date(now - 10 * oneDay).toISOString(),
    endDate: new Date(now - 1 * oneDay).toISOString(),
    instructions: 'Take at night before sleep.',
    status: 'expired',
    logs: [],
    createdAt: new Date(now - 10 * oneDay).toISOString(),
    updatedAt: new Date(now - 1 * oneDay).toISOString(),
  },
];

let inMemoryPatients = JSON.parse(JSON.stringify(initialPatients));
let inMemoryPrescriptions = [];
let inMemoryStaff = JSON.parse(JSON.stringify(initialStaff));
let inMemoryMedications = JSON.parse(JSON.stringify(initialMedications));

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
      console.warn('Socket emit error:', err.message);
    }
  }
};

const maskPatientName = (fullName) => {
  if (!fullName) return 'Patient';
  const parts = fullName.trim().split(' ');
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0] || ''}.`;
};

const computeMedStatus = (med) => {
  if (med.status === 'completed') return 'completed';
  const today = new Date().toISOString().split('T')[0];
  const end = new Date(med.endDate).toISOString().split('T')[0];
  return today > end ? 'expired' : 'active';
};

const sortQueue = (patients) => {
  const weight = { High: 3, Medium: 2, Normal: 1 };
  return [...patients].sort((a, b) => {
    if (a.status === 'In-Consultation' && b.status !== 'In-Consultation') return -1;
    if (b.status === 'In-Consultation' && a.status !== 'In-Consultation') return 1;
    if (a.status === 'Waiting' && b.status === 'Completed') return -1;
    if (b.status === 'Waiting' && a.status === 'Completed') return 1;
    if (a.status === 'Waiting' && b.status === 'Waiting') {
      const diff = (weight[b.priority] || 1) - (weight[a.priority] || 1);
      if (diff !== 0) return diff;
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
};

const generateNextToken = async () => {
  let tokens = [];
  if (getDatabaseStatus().isConnected) {
    const list = await Patient.find({}, 'tokenNumber').lean();
    tokens = list.map((p) => p.tokenNumber);
  } else {
    tokens = inMemoryPatients.map((p) => p.tokenNumber);
  }
  const nums = tokens
    .map((t) => {
      const match = (t || '').match(/\d+/);
      return match ? parseInt(match[0], 10) : 100;
    })
    .filter((n) => !isNaN(n));
  const max = nums.length > 0 ? Math.max(...nums) : 100;
  return `T-${max + 1}`;
};

module.exports = {
  setSocketIO,
  broadcastQueueUpdate,
  maskPatientName,

  getPatients: async (options = {}) => {
    const { search, status, page, limit } = options;
    let list = [];

    if (getDatabaseStatus().isConnected) {
      const query = {};
      if (status) query.status = status;
      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        query.$or = [{ name: regex }, { tokenNumber: regex }, { phone: regex }];
      }
      list = await Patient.find(query).populate('prescription').lean();
    } else {
      list = inMemoryPatients;
      if (status) list = list.filter((p) => p.status === status);
      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        list = list.filter(
          (p) =>
            (p.name && p.name.toLowerCase().includes(q)) ||
            (p.tokenNumber && p.tokenNumber.toLowerCase().includes(q)) ||
            (p.phone && p.phone.includes(q))
        );
      }
    }

    const sorted = sortQueue(list);

    if (page && limit) {
      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.max(1, parseInt(limit, 10));
      const start = (pageNum - 1) * limitNum;
      return {
        data: sorted.slice(start, start + limitNum),
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

  getPublicQueue: async () => {
    let list = [];
    if (getDatabaseStatus().isConnected) {
      list = await Patient.find({}, 'tokenNumber name priority status createdAt').lean();
    } else {
      list = inMemoryPatients.map((p) => ({
        tokenNumber: p.tokenNumber,
        name: p.name,
        priority: p.priority,
        status: p.status,
        createdAt: p.createdAt,
      }));
    }

    const sorted = sortQueue(list);
    return sorted.map((p, idx) => ({
      tokenNumber: p.tokenNumber,
      displayName: maskPatientName(p.name),
      priority: p.priority,
      status: p.status,
      queuePosition: p.status === 'Waiting' ? idx + 1 : null,
      estimatedWaitMinutes: p.status === 'Waiting' ? (idx + 1) * 10 : 0,
      registeredAt: p.createdAt,
    }));
  },

  getPatientById: async (id) => {
    if (getDatabaseStatus().isConnected) {
      return Patient.findById(id).populate('prescription').lean();
    }
    const found = inMemoryPatients.find((p) => String(p._id) === String(id));
    if (!found) return null;
    const copy = { ...found };
    if (copy.prescription) {
      copy.prescription =
        inMemoryPrescriptions.find((rx) => String(rx._id) === String(copy.prescription)) ||
        copy.prescription;
    }
    return copy;
  },

  createPatient: async (patientData) => {
    const tokenNumber = await generateNextToken();
    const payload = {
      ...patientData,
      tokenNumber,
      status: 'Waiting',
      prescription: null,
    };

    if (getDatabaseStatus().isConnected) {
      const doc = new Patient(payload);
      const saved = await doc.save();
      broadcastQueueUpdate('PATIENT_REGISTERED', saved.toObject());
      return saved.toObject();
    }

    const newPatient = {
      _id: 'pat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      ...payload,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    inMemoryPatients.push(newPatient);
    broadcastQueueUpdate('PATIENT_REGISTERED', newPatient);
    return newPatient;
  },

  updatePatientStatus: async (id, newStatus) => {
    if (getDatabaseStatus().isConnected) {
      const updated = await Patient.findByIdAndUpdate(
        id,
        { status: newStatus, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).lean();
      if (updated) broadcastQueueUpdate('PATIENT_UPDATED', updated);
      return updated;
    }

    const idx = inMemoryPatients.findIndex((p) => String(p._id) === String(id));
    if (idx === -1) return null;
    inMemoryPatients[idx].status = newStatus;
    inMemoryPatients[idx].updatedAt = new Date().toISOString();
    broadcastQueueUpdate('PATIENT_UPDATED', inMemoryPatients[idx]);
    return inMemoryPatients[idx];
  },

  deletePatient: async (id) => {
    if (getDatabaseStatus().isConnected) {
      const deleted = await Patient.findByIdAndDelete(id).lean();
      if (deleted) broadcastQueueUpdate('PATIENT_DELETED', { _id: id });
      return !!deleted;
    }

    const prevLen = inMemoryPatients.length;
    inMemoryPatients = inMemoryPatients.filter((p) => String(p._id) !== String(id));
    const wasDeleted = inMemoryPatients.length < prevLen;
    if (wasDeleted) broadcastQueueUpdate('PATIENT_DELETED', { _id: id });
    return wasDeleted;
  },

  callNextPatient: async () => {
    let list = [];
    if (getDatabaseStatus().isConnected) {
      list = await Patient.find({ status: 'Waiting' }).lean();
    } else {
      list = inMemoryPatients.filter((p) => p.status === 'Waiting');
    }

    if (list.length === 0) return null;
    const sortedWaiting = sortQueue(list);
    const nextPatient = sortedWaiting[0];

    if (getDatabaseStatus().isConnected) {
      const updated = await Patient.findByIdAndUpdate(
        nextPatient._id,
        { status: 'In-Consultation', updatedAt: new Date() },
        { new: true }
      ).lean();
      broadcastQueueUpdate('PATIENT_CALLED', updated);
      return updated;
    }

    const idx = inMemoryPatients.findIndex((p) => String(p._id) === String(nextPatient._id));
    if (idx !== -1) {
      inMemoryPatients[idx].status = 'In-Consultation';
      inMemoryPatients[idx].updatedAt = new Date().toISOString();
      broadcastQueueUpdate('PATIENT_CALLED', inMemoryPatients[idx]);
      return inMemoryPatients[idx];
    }
    return null;
  },

  createPrescription: async (rxData) => {
    let savedRx = null;

    if (getDatabaseStatus().isConnected) {
      const doc = new Prescription(rxData);
      savedRx = await doc.save();
      savedRx = savedRx.toObject();
      await Patient.findByIdAndUpdate(rxData.patientId, {
        status: 'Completed',
        prescription: savedRx._id,
        updatedAt: new Date(),
      });
    } else {
      savedRx = {
        _id: 'rx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        ...rxData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      inMemoryPrescriptions.push(savedRx);
      const pIdx = inMemoryPatients.findIndex((p) => String(p._id) === String(rxData.patientId));
      if (pIdx !== -1) {
        inMemoryPatients[pIdx].status = 'Completed';
        inMemoryPatients[pIdx].prescription = savedRx._id;
        inMemoryPatients[pIdx].updatedAt = new Date().toISOString();
      }
    }

    broadcastQueueUpdate('PRESCRIPTION_CREATED', savedRx);
    return savedRx;
  },

  getPrescriptions: async () => {
    if (getDatabaseStatus().isConnected) {
      return Prescription.find().sort({ createdAt: -1 }).lean();
    }
    return [...inMemoryPrescriptions].reverse();
  },

  getPrescriptionsByPatientId: async (patientId) => {
    if (getDatabaseStatus().isConnected) {
      return Prescription.find({ patientId }).sort({ createdAt: -1 }).lean();
    }
    return inMemoryPrescriptions
      .filter((p) => String(p.patientId) === String(patientId))
      .reverse();
  },

  findStaffByUsername: async (username) => {
    const cleanUser = String(username).toLowerCase().trim();
    if (getDatabaseStatus().isConnected) {
      let staff = await Staff.findOne({ username: cleanUser, isActive: true });
      if (!staff) {
        const fallback = initialStaff.find((s) => s.username === cleanUser);
        if (fallback) {
          try {
            staff = await Staff.create({
              username: fallback.username,
              name: fallback.name,
              role: fallback.role,
              passwordHash: fallback.passwordHash,
              isActive: true,
            });
          } catch (e) {
            staff = await Staff.findOne({ username: cleanUser, isActive: true });
          }
        }
      }
      return staff;
    }
    return inMemoryStaff.find((s) => s.username === cleanUser && s.isActive) || null;
  },

  findStaffByRole: async (role) => {
    const cleanRole = String(role).toLowerCase().trim();
    if (getDatabaseStatus().isConnected) {
      let staff = await Staff.findOne({ role: cleanRole, isActive: true });
      if (!staff) {
        const fallback = initialStaff.find((s) => s.role === cleanRole);
        if (fallback) {
          try {
            staff = await Staff.create({
              username: fallback.username,
              name: fallback.name,
              role: fallback.role,
              passwordHash: fallback.passwordHash,
              isActive: true,
            });
          } catch (e) {
            staff = await Staff.findOne({ role: cleanRole, isActive: true });
          }
        }
      }
      return staff;
    }
    return inMemoryStaff.find((s) => s.role === cleanRole && s.isActive) || null;
  },

  getMedications: async (options = {}) => {
    const { status, search } = options;
    let list = [];

    if (getDatabaseStatus().isConnected) {
      const query = {};
      if (status && status !== 'all') query.status = status;
      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        query.$or = [{ name: regex }, { instructions: regex }];
      }
      list = await Medication.find(query).sort({ createdAt: -1 }).lean();
    } else {
      list = inMemoryMedications;
      if (status && status !== 'all') list = list.filter((m) => m.status === status);
      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        list = list.filter(
          (m) =>
            (m.name && m.name.toLowerCase().includes(q)) ||
            (m.instructions && m.instructions.toLowerCase().includes(q))
        );
      }
    }

    return list.map((m) => ({ ...m, status: computeMedStatus(m) }));
  },

  getMedicationById: async (id) => {
    if (getDatabaseStatus().isConnected) {
      const med = await Medication.findById(id).lean();
      return med ? { ...med, status: computeMedStatus(med) } : null;
    }
    const found = inMemoryMedications.find((m) => String(m._id) === String(id));
    return found ? { ...found, status: computeMedStatus(found) } : null;
  },

  createMedication: async (data) => {
    const status = data.status || computeMedStatus(data);
    const payload = { ...data, status, logs: data.logs || [] };

    if (getDatabaseStatus().isConnected) {
      const doc = new Medication(payload);
      const saved = await doc.save();
      const obj = saved.toObject();
      return { ...obj, status: computeMedStatus(obj) };
    }

    const newMed = {
      _id: 'med_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      ...payload,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    inMemoryMedications.unshift(newMed);
    return newMed;
  },

  updateMedication: async (id, updateData) => {
    if (getDatabaseStatus().isConnected) {
      const updated = await Medication.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).lean();
      return updated ? { ...updated, status: computeMedStatus(updated) } : null;
    }

    const idx = inMemoryMedications.findIndex((m) => String(m._id) === String(id));
    if (idx === -1) return null;
    inMemoryMedications[idx] = {
      ...inMemoryMedications[idx],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    inMemoryMedications[idx].status = computeMedStatus(inMemoryMedications[idx]);
    return inMemoryMedications[idx];
  },

  deleteMedication: async (id) => {
    if (getDatabaseStatus().isConnected) {
      const deleted = await Medication.findByIdAndDelete(id).lean();
      return !!deleted;
    }
    const prevLen = inMemoryMedications.length;
    inMemoryMedications = inMemoryMedications.filter((m) => String(m._id) !== String(id));
    return inMemoryMedications.length < prevLen;
  },

  logMedicationDose: async (id, doseInfo) => {
    const { date, time, status } = doseInfo;
    const logEntry = { date, time, status, recordedAt: new Date().toISOString() };

    if (getDatabaseStatus().isConnected) {
      const med = await Medication.findById(id);
      if (!med) return null;
      if (!Array.isArray(med.logs)) med.logs = [];
      const idx = med.logs.findIndex((l) => l.date === date && l.time === time);
      if (idx >= 0) {
        med.logs[idx].status = status;
        med.logs[idx].recordedAt = new Date();
      } else {
        med.logs.push(logEntry);
      }
      const saved = await med.save();
      const obj = saved.toObject();
      return { ...obj, status: computeMedStatus(obj) };
    }

    const med = inMemoryMedications.find((m) => String(m._id) === String(id));
    if (!med) return null;
    if (!Array.isArray(med.logs)) med.logs = [];
    const idx = med.logs.findIndex((l) => l.date === date && l.time === time);
    if (idx >= 0) {
      med.logs[idx] = logEntry;
    } else {
      med.logs.push(logEntry);
    }
    med.updatedAt = new Date().toISOString();
    return { ...med, status: computeMedStatus(med) };
  },

  seedDatabase: async () => {
    if (!getDatabaseStatus().isConnected) return;
    try {
      const recExists = await Staff.findOne({ username: 'reception' });
      if (!recExists) {
        await Staff.create({
          username: 'reception',
          name: 'Front Desk Receptionist (Counter 1)',
          role: 'reception',
          passwordHash: process.env.RECEPTION_PIN
            ? bcrypt.hashSync(process.env.RECEPTION_PIN, 10)
            : DEFAULT_HASH,
          isActive: true,
        });
      }

      const docExists = await Staff.findOne({ username: 'doctor' });
      if (!docExists) {
        await Staff.create({
          username: 'doctor',
          name: 'Dr. A. Verma (MBBS, MD - General Medicine)',
          role: 'doctor',
          passwordHash: process.env.DOCTOR_PIN
            ? bcrypt.hashSync(process.env.DOCTOR_PIN, 10)
            : DEFAULT_HASH,
          isActive: true,
        });
      }

      const patientCount = await Patient.countDocuments();
      if (patientCount === 0) {
        const patientDocs = initialPatients.map((p) => ({
          ...p,
          _id: new mongoose.Types.ObjectId(p._id),
        }));
        await Patient.insertMany(patientDocs);
      }

      const medCount = await Medication.countDocuments();
      if (medCount === 0) {
        const medDocs = initialMedications.map((m) => ({
          ...m,
          _id: new mongoose.Types.ObjectId(m._id),
        }));
        await Medication.insertMany(medDocs);
      }
    } catch (err) {
      console.warn('Database seed warning:', err.message);
    }
  },
};
