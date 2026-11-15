// ==============================================================================
// MediTrack Unified Express Server
// [Requirement 1: JWT Auth]
// [Requirement 2: Role-Based Authorization]
// [Requirement 3: Patient Privacy Protection]
// [Requirement 5: Database Reliability & Graceful Error Handling]
// [Requirement 6: Smart Triage Engine]
// [Requirement 11: Modular REST API Architecture]
// ==============================================================================

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

const { connectDB, getDatabaseStatus } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middlewares
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());

// Initialize Database Connection
connectDB();

// ------------------------------------------------------------------------------
// API Routes
// ------------------------------------------------------------------------------

// System Health & Diagnostics Endpoint
app.get('/api/status', (req, res) => {
  const dbStatus = getDatabaseStatus();
  res.status(200).json({
    status: 'online',
    service: 'MediTrack Smart Outpatient Queue & Digital Prescription API',
    version: '2.5.0-secure',
    serverTime: new Date().toISOString(),
    database: {
      connected: dbStatus.isConnected,
      fallbackMode: dbStatus.fallbackMode,
      description: dbStatus.mode,
    },
    security: {
      authentication: 'JWT (HMAC-SHA256)',
      passwordHashing: 'Bcrypt (10 salt rounds)',
      privacyMasking: 'Active on /api/patients/public-queue',
      roleAuthorization: 'RBAC (reception / doctor)',
    },
  });
});

// API Directory Endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    service: 'MediTrack REST API',
    documentation: {
      publicQueue: 'GET /api/patients/public-queue',
      bookAppointment: 'POST /api/patients',
      staffLogin: 'POST /api/auth/login',
      privatePatients: 'GET /api/patients (Staff JWT required)',
      updateStatus: 'PUT /api/patients/:id (Staff JWT required)',
      deletePatient: 'DELETE /api/patients/:id (Reception JWT required)',
      issuePrescription: 'POST /api/prescriptions (Doctor JWT required)',
      listPrescriptions: 'GET /api/prescriptions (Staff JWT required)',
    },
  });
});

// Mount Feature Routers
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/prescriptions', prescriptionRoutes);

// ------------------------------------------------------------------------------
// Static Asset Serving & Single-Page Application (SPA) Routing
// ------------------------------------------------------------------------------
const frontendDistPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// ------------------------------------------------------------------------------
// Centralized Error Handling Middleware
// ------------------------------------------------------------------------------
app.use(errorHandler);

// Start Server when invoked directly (allows test runner to import app cleanly)
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`================================================================`);
    console.log(`🏥 MediTrack Clinic Secure API Server Running on port: ${PORT}`);
    console.log(`🌐 Server Local URL:   http://localhost:${PORT}`);
    console.log(`🌐 Server Loopback:    http://127.0.0.1:${PORT}`);
    console.log(`🔒 Authentication:     JWT + Bcrypt (Active)`);
    console.log(`🛡️ Patient Privacy:    Masked public queue enabled`);
    console.log(`================================================================`);
  });
}

module.exports = app;
