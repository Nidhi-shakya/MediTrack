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
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

const { connectDB, getDatabaseStatus } = require('./config/db');
const storage = require('./services/storageService');
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// [Phase 1: Security] Restrict CORS to approved frontend origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5000',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5000',
  process.env.CLIENT_URL,
  process.env.RENDER_EXTERNAL_URL,
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, server-to-server, curl, same-origin)
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.onrender.com')) {
      callback(null, true);
    } else {
      callback(new Error('CORS access blocked by security policy.'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());

// [Phase 3: Real-Time Smart Queue Updates with Socket.IO]
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

storage.setSocketIO(io);
app.set('io', io);

io.on('connection', (socket) => {
  socket.on('disconnect', () => {});
});

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
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`================================================================`);
    console.log(`🏥 MediTrack Clinic Secure API Server Running on port: ${PORT}`);
    console.log(`🌐 Server Local URL:   http://localhost:${PORT}`);
    console.log(`🌐 Server Loopback:    http://127.0.0.1:${PORT}`);
    console.log(`🔒 Authentication:     JWT + Bcrypt + Rate Limiter (Active)`);
    console.log(`🛡️ Patient Privacy:    Masked public queue enabled`);
    console.log(`⚡ Real-Time Engine:   Socket.IO Active`);
    console.log(`================================================================`);
  });
}

app.server = server;
app.io = io;
module.exports = app;
