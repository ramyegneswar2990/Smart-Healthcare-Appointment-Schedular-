const mongoose = require('mongoose');

const PrescriptionSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment'
    },
    date: {
        type: Date,
        default: Date.now
    },
    medicines: [{
        name: String,
        dosage: String, // e.g., "500mg"
        frequency: String, // e.g., "Twice a day"
        duration: String, // e.g., "5 days"
        time: String // e.g., "Morning", "Night"
    }],
    instructions: String
}, { timestamps: true });

module.exports = mongoose.model('Prescription', PrescriptionSchema);
