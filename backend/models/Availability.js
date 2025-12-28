const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema(
  {
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
    status: {
      type: String,
      enum: ['available', 'blocked'],
      default: 'blocked',
    },
    reason: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const availabilitySchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    timeSlots: {
      type: [timeSlotSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

availabilitySchema.index({ doctor: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Availability', availabilitySchema);
