const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config();

const { connectDB, getDatabaseStatus } = require('./config/db');
const storage = require('./services/storageService');
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const medicationRoutes = require('./routes/medicationRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

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

connectDB().then(() => storage.seedDatabase());

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
      chatMessage: 'POST /api/chat/message (AI Healthcare Assistant)',
      chatSuggestions: 'GET /api/chat/suggestions',
      medications: 'GET, POST /api/medications (Medicine Reminder)',
      medicationDose: 'POST /api/medications/:id/dose (Mark Taken/Skipped)',
    },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/chat', chatbotRoutes);
app.use('/api/medications', medicationRoutes);

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

app.use(errorHandler);

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
