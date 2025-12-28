const mongoose = require('mongoose');

const availabilitySlotSchema = new mongoose.Schema({
    dayOfWeek: {
        type: Number, // 0-6 (Sunday-Saturday)
        required: true
    },
    startTime: {
        type: String, // "09:00"
        required: true
    },
    endTime: {
        type: String, // "17:00"
        required: true
    },
    slotDuration: {
        type: Number, // in minutes
        default: 30
    },
    maxPatientsPerSlot: {
        type: Number,
        default: 1
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

const doctorAvailabilitySchema = new mongoose.Schema({
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    weeklySchedule: [availabilitySlotSchema],
    blockedDates: [{
        date: Date,
        reason: String
    }],
    preferredPatientTypes: [{
        condition: String,
        priority: {
            type: Number,
            default: 1
        }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('DoctorAvailability', doctorAvailabilitySchema);
