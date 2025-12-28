const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const smartScheduler = require('../services/smartScheduler');
const DoctorAvailability = require('../models/DoctorAvailability');

// @desc    Get AI-powered appointment recommendations
// @route   POST /api/scheduler/recommendations
// @access  Private (Patient)
router.post('/recommendations', protect, async (req, res) => {
    try {
        const { condition, preferredDate, urgency } = req.body;

        const recommendations = await smartScheduler.getRecommendations({
            patientId: req.user._id,
            condition: condition || 'General Checkup',
            preferredDate: preferredDate || new Date(),
            urgency: urgency || 'normal'
        });

        res.json(recommendations);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get recommendations',
            error: error.message
        });
    }
});

// @desc    Set doctor availability
// @route   POST /api/scheduler/availability
// @access  Private (Doctor)
router.post('/availability', protect, async (req, res) => {
    try {
        if (req.user.role !== 'doctor') {
            return res.status(403).json({
                success: false,
                message: 'Only doctors can set availability'
            });
        }

        const { weeklySchedule, blockedDates } = req.body;

        let availability = await DoctorAvailability.findOne({ doctor: req.user._id });

        if (availability) {
            availability.weeklySchedule = weeklySchedule;
            if (blockedDates) availability.blockedDates = blockedDates;
            await availability.save();
        } else {
            availability = await DoctorAvailability.create({
                doctor: req.user._id,
                weeklySchedule,
                blockedDates: blockedDates || []
            });
        }

        res.json({
            success: true,
            data: availability
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to set availability',
            error: error.message
        });
    }
});

// @desc    Get doctor availability
// @route   GET /api/scheduler/availability/:doctorId
// @access  Public
router.get('/availability/:doctorId', async (req, res) => {
    try {
        const availability = await DoctorAvailability.findOne({
            doctor: req.params.doctorId
        }).populate('doctor', 'name specialization');

        if (!availability) {
            return res.status(404).json({
                success: false,
                message: 'Availability not found'
            });
        }

        res.json({
            success: true,
            data: availability
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get availability',
            error: error.message
        });
    }
});

// @desc    Check for appointment conflicts
// @route   POST /api/scheduler/check-conflict
// @access  Private
router.post('/check-conflict', protect, async (req, res) => {
    try {
        const { doctorId, appointmentDate, appointmentTime } = req.body;

        const conflictCheck = await smartScheduler.detectConflicts(
            doctorId,
            appointmentDate,
            appointmentTime
        );

        res.json({
            success: true,
            data: conflictCheck
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to check conflicts',
            error: error.message
        });
    }
});

module.exports = router;
