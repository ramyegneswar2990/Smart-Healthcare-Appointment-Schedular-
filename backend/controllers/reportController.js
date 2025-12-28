const asyncHandler = require('../utils/asyncHandler');
const Report = require('../models/Report');
const User = require('../models/User');

// @desc    Get reports for logged-in patient
// @route   GET /api/reports
// @access  Private (Patient)
const getReports = asyncHandler(async (req, res) => {
    const reports = await Report.find({ patient: req.user._id })
        .populate('doctor', 'name specialization')
        .sort({ date: -1 });

    res.json({
        success: true,
        count: reports.length,
        data: reports
    });
});

// @desc    Create a new report (by patient or doctor)
// @route   POST /api/reports
// @access  Private
const createReport = asyncHandler(async (req, res) => {
    const { title, patientId, fileUrl, notes, status } = req.body;

    console.log('Create report request:', {
        title,
        patientId,
        fileUrl,
        notes,
        status,
        userRole: req.user.role,
        userId: req.user._id
    });

    // Validate title is present
    if (!title || title.trim() === '') {
        return res.status(400).json({
            success: false,
            message: 'Report title is required'
        });
    }

    let reportData = {
        title: title.trim(),
        fileUrl: fileUrl || '',
        notes: notes || '',
        status: status || 'pending'
    };

    // If user is a doctor, they can create reports for patients
    if (req.user.role === 'doctor') {
        if (!patientId) {
            return res.status(400).json({
                success: false,
                message: 'Patient ID is required when doctor creates a report'
            });
        }

        // Verify patient exists
        const patient = await User.findOne({ _id: patientId, role: 'patient' });
        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found'
            });
        }

        reportData.patient = patientId;
        reportData.doctor = req.user._id;
        reportData.status = 'reviewed'; // Doctor-created reports are pre-reviewed
    } else {
        // Patient creating their own report
        reportData.patient = req.user._id;
    }

    console.log('Creating report with data:', reportData);

    const report = await Report.create(reportData);

    const populatedReport = await Report.findById(report._id)
        .populate('doctor', 'name specialization')
        .populate('patient', 'name email');

    console.log('Report created successfully:', populatedReport);

    res.status(201).json({
        success: true,
        data: populatedReport
    });
});

// @desc    Get all reports for a specific patient (Doctor view)
// @route   GET /api/reports/patient/:patientId
// @access  Private (Doctor)
const getPatientReports = asyncHandler(async (req, res) => {
    if (req.user.role !== 'doctor') {
        return res.status(403).json({
            success: false,
            message: 'Only doctors can access this endpoint'
        });
    }

    const reports = await Report.find({ patient: req.params.patientId })
        .populate('doctor', 'name specialization')
        .sort({ date: -1 });

    res.json({
        success: true,
        count: reports.length,
        data: reports
    });
});

// @desc    Update report status
// @route   PATCH /api/reports/:id
// @access  Private (Doctor)
const updateReportStatus = asyncHandler(async (req, res) => {
    const { status, notes } = req.body;

    const report = await Report.findById(req.params.id);

    if (!report) {
        return res.status(404).json({
            success: false,
            message: 'Report not found'
        });
    }

    if (status) report.status = status;
    if (notes) report.notes = notes;

    await report.save();

    const updatedReport = await Report.findById(report._id)
        .populate('doctor', 'name specialization')
        .populate('patient', 'name email');

    res.json({
        success: true,
        data: updatedReport
    });
});

module.exports = {
    getReports,
    createReport,
    getPatientReports,
    updateReportStatus
};
