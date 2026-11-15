// ==============================================================================
// MediTrack Backend Server (Express + MongoDB Atlas + Smart In-Memory Fallback)
// [Requirement 11: REST API]
// [Requirement 12: Environment Variables]
// [Requirement 13: MongoDB CRUD]
// [Requirement 14: MongoDB Atlas Integration + In-Memory Fallback]
// [Requirement 15: Mongoose Schemas]
// [Requirement 5: Error Handling]
// ==============================================================================

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// [Requirement 12: Environment Variables]
dotenv.config();

const Patient = require('./models/Patient');
const Prescription = require('./models/Prescription');

const app = express();
const PORT = process.env.PORT || 5000;
const STAFF_PIN = process.env.STAFF_PIN || '1234';

// Middlewares with explicit CORS configuration
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());

// Track whether MongoDB Atlas is currently connected
let isAtlasConnected = false;

// ------------------------------------------------------------------------------
// Seed Data: 4 Realistic Indian Patients for Demonstration
// ------------------------------------------------------------------------------
const seedPatients = [
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

// Smart In-Memory Fallback Storage (in case MongoDB Atlas is unreachable during viva demo)
let inMemoryPatients = JSON.parse(JSON.stringify(seedPatients));
let inMemoryPrescriptions = [];

// ------------------------------------------------------------------------------
// Automated Smart Triage Calculation Engine
// ------------------------------------------------------------------------------
function calculateTriage(age, temperature, symptoms) {
  const normalizedSymptoms = (symptoms || '').toLowerCase();
  const hasCriticalSymptoms =
    normalizedSymptoms.includes('chest pain') ||
    normalizedSymptoms.includes('breathing difficulty') ||
    normalizedSymptoms.includes('shortness of breath') ||
    normalizedSymptoms.includes('unconscious');

  // Rule 1: High Priority (Red Badge, Risk Score 85%)
  if (age >= 65 || temperature >= 102 || hasCriticalSymptoms) {
    return { priority: 'High', riskScore: 85 };
  }

  // Rule 2: Medium Priority (Yellow Badge, Risk Score 50%)
  if (age >= 50 || temperature >= 100) {
    return { priority: 'Medium', riskScore: 50 };
  }

  // Rule 3: Normal Priority (Green Badge, Risk Score 15%)
  return { priority: 'Normal', riskScore: 15 };
}

// Generate Next Token Number
function getNextTokenNumber(existingPatients) {
  const numbers = existingPatients
    .map((p) => {
      const match = (p.tokenNumber || '').match(/\d+/);
      return match ? parseInt(match[0], 10) : 100;
    })
    .filter((n) => !isNaN(n));

  const maxNum = numbers.length > 0 ? Math.max(...numbers) : 100;
  return `T-${maxNum + 1}`;
}

// ------------------------------------------------------------------------------
// [Requirement 14: MongoDB Atlas Integration + Smart In-Memory Fallback]
// ------------------------------------------------------------------------------
const MONGODB_URI = process.env.MONGODB_URI;

mongoose
  .connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 2000,
  })
  .then(async () => {
    isAtlasConnected = true;
    console.log('✅ [Requirement 14] Successfully connected to MongoDB Atlas Cloud Cluster!');

    const count = await Patient.countDocuments();
    if (count === 0) {
      await Patient.insertMany(seedPatients);
      console.log('🌱 Database Seeded: 4 Realistic Indian patient records inserted into Atlas.');
    }
  })
  .catch((err) => {
    isAtlasConnected = false;
    console.log('----------------------------------------------------------------');
    console.log('ℹ️ [Requirement 14: Smart In-Memory Fallback Active]');
    console.log('   MongoDB Atlas Cloud cluster is not reachable or using demo placeholder.');
    console.log('   App is running with full in-memory CRUD operations & 4 seed patients.');
    console.log('   Status: 100% OPERATIONAL for viva demonstration!');
    console.log('----------------------------------------------------------------');
  });

// ------------------------------------------------------------------------------
// [Requirement 11: REST API Modular Endpoints]
// ------------------------------------------------------------------------------

// Health & Status Check Endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    serverTime: new Date().toISOString(),
    databaseMode: isAtlasConnected ? 'MongoDB Atlas (Cloud)' : 'Smart In-Memory Array Fallback',
    isAtlasConnected,
    patientsCount: isAtlasConnected ? null : inMemoryPatients.length,
  });
});

// API Info Endpoint
app.get('/api', (req, res) => {
  res.json({
    service: 'MediTrack Clinic REST API',
    version: '2.0.0',
    status: 'online',
    endpoints: [
      'GET /api/status',
      'GET /api/patients',
      'POST /api/patients',
      'PUT /api/patients/:id',
      'DELETE /api/patients/:id',
      'GET /api/prescriptions',
      'POST /api/prescriptions',
      'POST /api/auth/login',
    ],
  });
});

// 1. Staff Authentication Login Route
// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  // [Requirement 5: Error Handling]
  try {
    const { pin, role } = req.body;

    if (!pin) {
      return res.status(400).json({ success: false, message: 'Please provide the 4-digit staff PIN.' });
    }

    if (String(pin).trim() !== String(STAFF_PIN).trim()) {
      return res.status(401).json({ success: false, message: 'Invalid Staff PIN! Default demo PIN is 1234.' });
    }

    const assignedRole = role === 'doctor' ? 'doctor' : 'reception';
    return res.status(200).json({
      success: true,
      message: `Staff authenticated successfully as ${assignedRole.toUpperCase()}.`,
      token: 'jwt-meditrack-simulated-token-xyz987',
      user: {
        role: assignedRole,
        name: assignedRole === 'doctor' ? 'Dr. A. Verma (MBBS, MD)' : 'Staff Receptionist (Counter 1)',
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 2. Fetch All Patients (Sorted by Priority & Status)
// GET /api/patients
// [Requirement 13: MongoDB CRUD - Read]
app.get('/api/patients', async (req, res) => {
  try {
    let patientsList;

    if (isAtlasConnected) {
      patientsList = await Patient.find().populate('prescription').lean();
    } else {
      patientsList = [...inMemoryPatients];
    }

    // Sort order: In-Consultation first, then Waiting sorted by Priority (High > Medium > Normal), then Completed
    const priorityWeight = { High: 3, Medium: 2, Normal: 1 };
    patientsList.sort((a, b) => {
      // Put In-Consultation at top
      if (a.status === 'In-Consultation' && b.status !== 'In-Consultation') return -1;
      if (b.status === 'In-Consultation' && a.status !== 'In-Consultation') return 1;

      // Put Waiting before Completed
      if (a.status === 'Waiting' && b.status === 'Completed') return -1;
      if (b.status === 'Waiting' && a.status === 'Completed') return 1;

      // If both Waiting, sort by Priority
      if (a.status === 'Waiting' && b.status === 'Waiting') {
        const weightA = priorityWeight[a.priority] || 1;
        const weightB = priorityWeight[b.priority] || 1;
        if (weightB !== weightA) return weightB - weightA;
        return new Date(a.createdAt) - new Date(b.createdAt);
      }

      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return res.status(200).json({
      success: true,
      count: patientsList.length,
      database: isAtlasConnected ? 'MongoDB Atlas' : 'In-Memory Fallback',
      data: patientsList,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 3. Register New Patient / Generate Token with Automated Triage
// POST /api/patients
// [Requirement 13: MongoDB CRUD - Create]
app.post('/api/patients', async (req, res) => {
  try {
    const { name, age, gender, phone, symptoms, temperature } = req.body;

    // Strict Backend Validations
    if (!name || name.trim().length < 3) {
      return res.status(400).json({ success: false, message: 'Patient name must be at least 3 characters long.' });
    }
    const numAge = Number(age);
    if (!age || isNaN(numAge) || numAge < 1 || numAge > 120) {
      return res.status(400).json({ success: false, message: 'Age must be a valid number between 1 and 120.' });
    }
    if (!['Male', 'Female', 'Other'].includes(gender)) {
      return res.status(400).json({ success: false, message: 'Gender must be Male, Female, or Other.' });
    }
    if (!phone || !/^[6-9]\d{9}$/.test(String(phone).trim())) {
      return res.status(400).json({ success: false, message: 'Phone must be a valid 10-digit Indian number starting with 6-9.' });
    }
    const numTemp = Number(temperature);
    if (!temperature || isNaN(numTemp) || numTemp < 95 || numTemp > 108) {
      return res.status(400).json({ success: false, message: 'Temperature must be between 95°F and 108°F.' });
    }
    if (!symptoms || symptoms.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Please describe the symptoms.' });
    }

    // Automated Smart Triage Calculation
    const { priority, riskScore } = calculateTriage(numAge, numTemp, symptoms);

    let savedPatient;

    if (isAtlasConnected) {
      const existingPatients = await Patient.find({}, 'tokenNumber').lean();
      const tokenNumber = getNextTokenNumber(existingPatients);

      const newPatient = new Patient({
        tokenNumber,
        name: name.trim(),
        age: numAge,
        gender,
        phone: String(phone).trim(),
        symptoms: symptoms.trim(),
        temperature: numTemp,
        priority,
        riskScore,
        status: 'Waiting',
      });

      savedPatient = await newPatient.save();
    } else {
      // In-Memory Fallback
      const tokenNumber = getNextTokenNumber(inMemoryPatients);
      savedPatient = {
        _id: 'mem_' + Date.now() + Math.random().toString(36).substr(2, 4),
        tokenNumber,
        name: name.trim(),
        age: numAge,
        gender,
        phone: String(phone).trim(),
        symptoms: symptoms.trim(),
        temperature: numTemp,
        priority,
        riskScore,
        status: 'Waiting',
        prescription: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      inMemoryPatients.push(savedPatient);
    }

    return res.status(201).json({
      success: true,
      message: `Appointment registered successfully! Allocated Token: ${savedPatient.tokenNumber} (${savedPatient.priority} Priority)`,
      data: savedPatient,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 4. Update Patient Status (Waiting -> In-Consultation -> Completed)
// PUT /api/patients/:id
// [Requirement 13: MongoDB CRUD - Update]
app.put('/api/patients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority } = req.body;

    const allowedStatuses = ['Waiting', 'In-Consultation', 'Completed'];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value provided.' });
    }

    let updatedPatient;

    if (isAtlasConnected) {
      const updateData = {};
      if (status) updateData.status = status;
      if (priority) updateData.priority = priority;

      updatedPatient = await Patient.findByIdAndUpdate(id, updateData, { new: true });
      if (!updatedPatient) {
        return res.status(404).json({ success: false, message: 'Patient record not found in Atlas.' });
      }
    } else {
      const patientIndex = inMemoryPatients.findIndex((p) => String(p._id) === String(id));
      if (patientIndex === -1) {
        return res.status(404).json({ success: false, message: 'Patient record not found in in-memory state.' });
      }

      if (status) inMemoryPatients[patientIndex].status = status;
      if (priority) inMemoryPatients[patientIndex].priority = priority;
      inMemoryPatients[patientIndex].updatedAt = new Date().toISOString();
      updatedPatient = inMemoryPatients[patientIndex];
    }

    return res.status(200).json({
      success: true,
      message: `Patient ${updatedPatient.tokenNumber} status updated to '${updatedPatient.status}'.`,
      data: updatedPatient,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 5. Delete Patient Record
// DELETE /api/patients/:id
// [Requirement 13: MongoDB CRUD - Delete]
app.delete('/api/patients/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (isAtlasConnected) {
      const deleted = await Patient.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Patient record not found.' });
      }
    } else {
      const initialLen = inMemoryPatients.length;
      inMemoryPatients = inMemoryPatients.filter((p) => String(p._id) !== String(id));
      if (inMemoryPatients.length === initialLen) {
        return res.status(404).json({ success: false, message: 'Patient record not found.' });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Patient record deleted successfully.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 6. Save Digital Prescription & Automatically Complete Patient Status
// POST /api/prescriptions
app.post('/api/prescriptions', async (req, res) => {
  try {
    const { patientId, diagnosis, medicines, notes, doctorName } = req.body;

    if (!patientId) {
      return res.status(400).json({ success: false, message: 'Patient ID is required.' });
    }
    if (!diagnosis || diagnosis.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Clinical diagnosis is required.' });
    }
    if (!Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({ success: false, message: 'Prescription must contain at least one medicine.' });
    }

    let savedPrescription;

    if (isAtlasConnected) {
      const targetPatient = await Patient.findById(patientId);
      if (!targetPatient) {
        return res.status(404).json({ success: false, message: 'Patient not found.' });
      }

      const newPrescription = new Prescription({
        patientId: targetPatient._id,
        patientName: targetPatient.name,
        tokenNumber: targetPatient.tokenNumber,
        doctorName: doctorName || 'Dr. A. Verma (MBBS, MD - General Medicine)',
        diagnosis: diagnosis.trim(),
        medicines,
        notes: notes || 'Drink plenty of water and complete the full antibiotic course.',
      });

      savedPrescription = await newPrescription.save();

      // Automatically update patient status to Completed & link prescription
      targetPatient.status = 'Completed';
      targetPatient.prescription = savedPrescription._id;
      await targetPatient.save();
    } else {
      // In-Memory Fallback
      const targetPatient = inMemoryPatients.find((p) => String(p._id) === String(patientId));
      if (!targetPatient) {
        return res.status(404).json({ success: false, message: 'Patient not found in memory.' });
      }

      savedPrescription = {
        _id: 'rx_' + Date.now(),
        patientId: targetPatient._id,
        patientName: targetPatient.name,
        tokenNumber: targetPatient.tokenNumber,
        doctorName: doctorName || 'Dr. A. Verma (MBBS, MD - General Medicine)',
        diagnosis: diagnosis.trim(),
        medicines,
        notes: notes || 'Drink plenty of water and complete the full course.',
        createdAt: new Date().toISOString(),
      };

      inMemoryPrescriptions.push(savedPrescription);

      // Automatically update patient status to Completed
      targetPatient.status = 'Completed';
      targetPatient.prescription = savedPrescription;
      targetPatient.updatedAt = new Date().toISOString();
    }

    return res.status(201).json({
      success: true,
      message: `Prescription saved successfully! Patient status marked as 'Completed'.`,
      data: savedPrescription,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 7. Get All Prescriptions
// GET /api/prescriptions
app.get('/api/prescriptions', async (req, res) => {
  try {
    let list;
    if (isAtlasConnected) {
      list = await Prescription.find().sort({ createdAt: -1 }).lean();
    } else {
      list = [...inMemoryPrescriptions].reverse();
    }
    return res.status(200).json({ success: true, count: list.length, data: list });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ------------------------------------------------------------------------------
// Unified Full-Stack Single-Host Deployment (Serve Built React Frontend)
// ------------------------------------------------------------------------------
const frontendDistPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  // Serve static assets (js, css, images) from the production build directory
  app.use(express.static(frontendDistPath));

  // Client-side React Router fallback: serve index.html for all non-API web routes
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
  console.log(`📦 Serving React production build from: ${frontendDistPath}`);
}

// ------------------------------------------------------------------------------
// [Requirement 5: Express Global Error Handling Middleware]
// ------------------------------------------------------------------------------
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error encountered in MediTrack API',
    error: process.env.NODE_ENV === 'production' ? null : err.message,
  });
});

// Start Server explicitly on 0.0.0.0 for universal reachability
app.listen(PORT, '0.0.0.0', () => {
  console.log(`================================================================`);
  console.log(`🏥 MediTrack Clinic API Server is ONLINE and READY!`);
  console.log(`🌐 Server Local URL:   http://localhost:${PORT}`);
  console.log(`🌐 Server Loopback:    http://127.0.0.1:${PORT}`);
  console.log(`🔑 Demo Staff PIN:     ${STAFF_PIN}`);
  console.log(`================================================================`);
});
