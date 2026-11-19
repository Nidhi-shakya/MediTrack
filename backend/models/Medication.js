const mongoose = require('mongoose');

const doseLogSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Taken', 'Skipped'],
    required: true,
  },
  recordedAt: {
    type: Date,
    default: Date.now,
  },
});

const medicationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true,
      minlength: [2, 'Medicine name must be at least 2 characters'],
      maxlength: [120, 'Medicine name cannot exceed 120 characters'],
    },
    dosage: {
      type: String,
      required: [true, 'Dosage is required (e.g., 500mg, 1 tablet)'],
      trim: true,
      maxlength: [80, 'Dosage description cannot exceed 80 characters'],
    },
    frequency: {
      type: String,
      required: [true, 'Frequency is required'],
      enum: {
        values: [
          'Once Daily',
          'Twice Daily',
          'Thrice Daily',
          'Four Times Daily',
          'Every 8 Hours',
          'Every 12 Hours',
          'Weekly',
          'As Needed',
        ],
        message: '{VALUE} is not an accepted frequency option',
      },
    },
    times: {
      type: [String],
      required: [true, 'At least one reminder time is required'],
      validate: {
        validator: function (arr) {
          if (!Array.isArray(arr) || arr.length === 0) return false;
          const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
          return arr.every((t) => typeof t === 'string' && timeRegex.test(t));
        },
        message: 'Reminder times must be valid 24-hour format strings (HH:mm)',
      },
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
      validate: {
        validator: function (val) {
          return !this.startDate || val >= this.startDate;
        },
        message: 'End date cannot be prior to start date',
      },
    },
    instructions: {
      type: String,
      trim: true,
      default: 'Take with a glass of water after food.',
      maxlength: [250, 'Instructions cannot exceed 250 characters'],
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'expired'],
      default: 'active',
    },
    patientName: {
      type: String,
      trim: true,
      default: 'Self',
    },
    patientId: {
      type: String,
      default: null,
    },
    logs: {
      type: [doseLogSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

medicationSchema.index({ status: 1, startDate: 1, endDate: 1 });
medicationSchema.index({ patientId: 1 });

medicationSchema.methods.calculateStatus = function () {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = new Date(this.startDate);
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const end = new Date(this.endDate);
  const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());

  if (today < startDay) {
    return 'active';
  }
  if (today > endDay) {
    return 'expired';
  }
  return 'active';
};

const Medication = mongoose.model('Medication', medicationSchema);

module.exports = Medication;
