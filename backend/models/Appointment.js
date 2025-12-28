const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please add a patient'],
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please add a doctor'],
    },
    appointmentDate: {
      type: Date,
      required: [true, 'Please add an appointment date'],
    },
    appointmentTime: {
      type: String,
      required: [true, 'Please add an appointment time'],
    },
    status: {
      type: String,
      enum: ['booked', 'confirmed', 'cancelled', 'completed'],
      default: 'booked',
      index: true,
    },
    reason: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    duration: {
      type: Number,
      default: 30, // minutes
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
appointmentSchema.index({ doctor: 1, appointmentDate: 1 });
appointmentSchema.index({ patient: 1, appointmentDate: 1 });
appointmentSchema.index(
  { doctor: 1, appointmentDate: 1, appointmentTime: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ['booked', 'confirmed'] } },
  }
);

module.exports = mongoose.model('Appointment', appointmentSchema);

