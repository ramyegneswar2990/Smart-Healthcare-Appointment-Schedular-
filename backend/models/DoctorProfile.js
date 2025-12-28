const mongoose = require('mongoose');

const doctorProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    specialization: {
      type: String,
      trim: true,
    },
    yearsOfExperience: {
      type: Number,
      min: 0,
    },
    consultationFee: {
      type: Number,
      min: 0,
    },
    slotDuration: {
      type: Number,
      default: 30, // minutes
      min: 5,
    },
    workingHours: [
      {
        dayOfWeek: {
          type: Number,
          min: 0,
          max: 6,
          required: true,
        },
        startTime: {
          type: String,
          required: true,
          match: [/^\d{2}:\d{2}$/, 'startTime must be HH:mm'],
        },
        endTime: {
          type: String,
          required: true,
          match: [/^\d{2}:\d{2}$/, 'endTime must be HH:mm'],
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

doctorProfileSchema.index({ specialization: 1 });

module.exports = mongoose.model('DoctorProfile', doctorProfileSchema);
