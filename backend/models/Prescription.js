// [Requirement 15: Mongoose Schemas]
// backend/models/Prescription.js
const mongoose = require('mongoose');

const medicineItemSchema = new mongoose.Schema({
  medicineName: {
    type: String,
    required: [true, 'Medicine name is required'],
    trim: true,
  },
  dosage: {
    type: String,
    required: [true, 'Dosage pattern is required (e.g., 1-0-1)'],
    enum: {
      values: ['1-0-0', '1-0-1', '0-0-1', '1-1-1', '0-1-0', 'As Needed'],
      message: '{VALUE} is not a valid dosage frequency',
    },
  },
  duration: {
    type: String,
    required: [true, 'Duration is required (e.g., 5 Days, 1 Week)'],
    trim: true,
  },
});

const prescriptionSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient ID reference is required'],
    },
    patientName: {
      type: String,
      required: [true, 'Patient name is required'],
    },
    tokenNumber: {
      type: String,
      required: [true, 'Token number is required'],
    },
    doctorName: {
      type: String,
      required: true,
      default: 'Dr. A. Verma (MBBS, MD - General Medicine)',
    },
    diagnosis: {
      type: String,
      required: [true, 'Clinical diagnosis is required'],
      trim: true,
    },
    medicines: {
      type: [medicineItemSchema],
      validate: {
        validator: function (arr) {
          return Array.isArray(arr) && arr.length > 0;
        },
        message: 'Prescription must contain at least one medicine',
      },
    },
    notes: {
      type: String,
      default: 'Drink plenty of warm water. Avoid oily and cold foods. Review after 3 days if symptoms persist.',
    },
    doctorNotes: {
      type: String,
      default: '',
    },
    followUpDate: {
      type: String,
      default: 'After 3 Days',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for Fast Prescription History Lookup (Phase 4 & 5)
prescriptionSchema.index({ patientId: 1, createdAt: -1 });
prescriptionSchema.index({ tokenNumber: 1 });

module.exports = mongoose.model('Prescription', prescriptionSchema);

