const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
    channel: {
      type: String,
      enum: ['email', 'sms', 'whatsapp'],
      required: true,
    },
    type: {
      type: String,
      enum: ['booking', 'cancellation', 'reminder'],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed'],
      default: 'pending',
      index: true,
    },
    attemptCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxAttempts: {
      type: Number,
      default: 3,
      min: 1,
    },
    subject: { type: String },
    message: { type: String },
    error: { type: String },
    scheduledFor: { type: Date, default: Date.now, index: true },
    sentAt: { type: Date },
    meta: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

notificationSchema.index({ scheduledFor: 1, status: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
