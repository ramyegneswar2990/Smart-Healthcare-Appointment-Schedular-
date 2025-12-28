const Prescription = require('../models/Prescription');

// @desc    Get all prescriptions for logged in patient or doctor
// @route   GET /api/prescriptions
// @access  Private
exports.getPrescriptions = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'patient') {
            query = { patient: req.user._id };
        } else if (req.user.role === 'doctor') {
            query = { doctor: req.user._id };
        }

        const prescriptions = await Prescription.find(query)
            .populate('patient', 'name email')
            .populate('doctor', 'name specialization')
            .sort({ date: -1 });

        res.status(200).json({
            success: true,
            count: prescriptions.length,
            data: prescriptions
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create a prescription
// @route   POST /api/prescriptions
// @access  Private/Doctor
exports.createPrescription = async (req, res) => {
    try {
        req.body.doctor = req.user._id;
        const prescription = await Prescription.create(req.body);
        res.status(201).json({ success: true, data: prescription });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
