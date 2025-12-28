const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    title: {
        type: String,
        required: true // e.g., "Blood Test", "X-Ray"
    },
    date: {
        type: Date,
        default: Date.now
    },
    fileUrl: String,
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'updated'],
        default: 'pending'
    },
    notes: String
}, { timestamps: true });

module.exports = mongoose.model('Report', ReportSchema);
