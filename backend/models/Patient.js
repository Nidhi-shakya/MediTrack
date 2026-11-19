const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    tokenNumber: {
      type: String,
      required: [true, 'Token number is required'],
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
      minlength: [3, 'Name must be at least 3 characters long'],
    },
    age: {
      type: Number,
      required: [true, 'Patient age is required'],
      min: [1, 'Age must be at least 1 year'],
      max: [120, 'Age cannot exceed 120 years'],
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: {
        values: ['Male', 'Female', 'Other'],
        message: '{VALUE} is not a supported gender option',
      },
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^[6-9]\d{9}$/, 'Must be a valid 10-digit Indian mobile number starting with 6-9'],
    },
    symptoms: {
      type: String,
      required: [true, 'Symptoms description is required'],
      trim: true,
    },
    temperature: {
      type: Number,
      required: [true, 'Body temperature in Fahrenheit is required'],
      min: [95, 'Body temperature cannot be lower than 95°F'],
      max: [108, 'Body temperature cannot exceed 108°F'],
    },
    priority: {
      type: String,
      required: true,
      enum: ['High', 'Medium', 'Normal'],
      default: 'Normal',
    },
    riskScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 15,
    },
    status: {
      type: String,
      required: true,
      enum: ['Waiting', 'In-Consultation', 'Completed'],
      default: 'Waiting',
    },
    prescription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prescription',
      default: null,
    },
  },
  {
    timestamps: true, 
  }
);

patientSchema.index({ status: 1, priority: 1, createdAt: 1 });
patientSchema.index({ tokenNumber: 1 });
patientSchema.index({ name: 1 });
patientSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Patient', patientSchema);

