const mongoose = require('mongoose');

let isConnected = false;
let fallbackMode = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.includes('cluster0.abcde.mongodb.net')) {
    console.log('----------------------------------------------------------------');
    console.log('ℹ️ [Requirement 14: In-Memory Fallback Active]');
    console.log('   MONGODB_URI is using a placeholder string or not set.');
    console.log('   Running in resilient in-memory database mode for demo.');
    console.log('----------------------------------------------------------------');
    fallbackMode = true;
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });

    isConnected = true;
    fallbackMode = false;
    console.log(`✅ [MongoDB Atlas Connected] Host: ${conn.connection.host}`);
    return true;
  } catch (error) {
    isConnected = false;
    fallbackMode = true;
    console.warn(`⚠️ [MongoDB Connection Warning] ${error.message}`);
    console.log('🚀 Activating Smart In-Memory Database Fallback for 100% demo uptime.');
    return false;
  }
};

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('⚠️ MongoDB connection lost. Database state: disconnected.');
});

mongoose.connection.on('reconnected', () => {
  isConnected = true;
  fallbackMode = false;
  console.log('🔄 MongoDB reconnected successfully.');
});

mongoose.connection.on('error', (err) => {
  console.error(`❌ MongoDB connection error: ${err.message}`);
});

const getDatabaseStatus = () => {
  return {
    isConnected,
    fallbackMode,
    mode: isConnected ? 'MongoDB Atlas (Cloud Cluster)' : 'Smart In-Memory Database (Offline Fallback)',
    readyState: mongoose.connection.readyState,
  };
};

module.exports = {
  connectDB,
  getDatabaseStatus,
};

