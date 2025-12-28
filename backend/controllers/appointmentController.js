const { validationResult } = require('express-validator');
const asyncHandler = require('../utils/asyncHandler');
const appointmentService = require('../services/appointmentService');
const { recommendSlots } = require('../services/slotRecommendationService');

// @desc    Create appointment
// @route   POST /api/appointments
// @access  Private (Patient)
const createAppointment = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const appointmentData = {
    ...req.body,
    patient: req.user._id,
  };

  const appointment = await appointmentService.createAppointment(appointmentData);

  res.status(201).json({
    success: true,
    data: appointment,
  });
});

// @desc    Get all appointments for current user
// @route   GET /api/appointments
// @access  Private
const getAppointments = asyncHandler(async (req, res) => {
  const appointments = await appointmentService.getAppointmentsByUser(
    req.user._id,
    req.user.role
  );

  res.json({
    success: true,
    count: appointments.length,
    data: appointments,
  });
});

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
const getAppointment = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.getAppointmentById(
    req.params.id,
    req.user._id,
    req.user.role
  );

  res.json({
    success: true,
    data: appointment,
  });
});

// @desc    Update appointment status
// @route   PATCH /api/appointments/:id/status
// @access  Private
const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const appointment = await appointmentService.updateAppointmentStatus(
    req.params.id,
    status,
    req.user._id,
    req.user.role
  );

  res.json({
    success: true,
    data: appointment,
  });
});

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private
const updateAppointment = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.updateAppointment(
    req.params.id,
    req.body,
    req.user._id,
    req.user.role
  );

  res.json({
    success: true,
    data: appointment,
  });
});

// @desc    Cancel appointment
// @route   POST /api/appointments/:id/cancel
// @access  Private (Doctor or Patient participant)
const cancelAppointment = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const appointment = await appointmentService.cancelAppointment(
    req.params.id,
    req.user._id,
    req.user.role,
    req.body.reason
  );

  res.json({
    success: true,
    data: appointment,
  });
});

// @desc    Reschedule appointment
// @route   POST /api/appointments/:id/reschedule
// @access  Private (Doctor or Patient participant)
const rescheduleAppointment = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const appointment = await appointmentService.rescheduleAppointment(
    req.params.id,
    req.user._id,
    req.user.role,
    {
      appointmentDate: req.body.appointmentDate,
      appointmentTime: req.body.appointmentTime,
    }
  );

  res.json({
    success: true,
    data: appointment,
  });
});

// @desc    Recommend appointment slots for patient & doctor
// @route   POST /api/appointments/recommendations
// @access  Private (Patient)
const recommendAppointmentSlots = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { doctorId, preferences } = req.body;
  const recommendations = await recommendSlots({
    doctorId,
    patientId: req.user._id,
    preferences,
  });

  res.json({
    success: true,
    count: recommendations.length,
    data: recommendations,
  });
});

// @desc    Get dashboard stats for doctor
// @route   GET /api/appointments/stats
// @access  Private (Doctor)
const getDashboardStats = asyncHandler(async (req, res) => {
  const doctorId = req.user._id;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Fetch all appointments for the doctor
  const appointmentsAll = (await appointmentService.getAppointmentsByUser(
    doctorId,
    'doctor'
  ));

  // 1. Total Unique Patients
  const uniquePatients = new Set(appointmentsAll.map(a => a.patient?._id?.toString()).filter(id => id)).size;

  // 2. Today's Confirmed Appointments
  const todayAppointments = appointmentsAll.filter(a => {
    const appDate = new Date(a.appointmentDate);
    const sameDay = appDate.getFullYear() === today.getFullYear() &&
      appDate.getMonth() === today.getMonth() &&
      appDate.getDate() === today.getDate();
    return sameDay && a.status === 'confirmed';
  });

  // 3. Today's Total Patients (anyone scheduled for today regardless of status, or maybe just confirmed?)
  // Let's stick to confirmed for the count.
  const todayPatientsCount = new Set(todayAppointments.map(a => a.patient?._id?.toString()).filter(id => id)).size;

  // 4. Pending Requests (where status is 'booked')
  const pendingRequests = appointmentsAll.filter(a => a.status === 'booked');

  res.json({
    success: true,
    data: {
      totalPatients: uniquePatients,
      todayPatients: todayPatientsCount,
      todayAppointments: todayAppointments.length,
      appointments: todayAppointments,
      requests: pendingRequests
    }
  });
});

// @desc    Get dashboard stats for patient
// @route   GET /api/appointments/patient-stats
// @access  Private (Patient)
const getPatientStats = asyncHandler(async (req, res) => {
  const patientId = req.user._id;

  // Get all appointments
  const appointments = await appointmentService.getAppointmentsByUser(patientId, 'patient');

  // Get next appointment
  const now = new Date();
  const nextApp = appointments
    .filter(a => new Date(a.appointmentDate) >= now && a.status === 'confirmed')
    .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))[0];

  // We'll need to fetch reports and prescriptions count here too, but for now let's just do appointments
  const Prescription = require('../models/Prescription');
  const Report = require('../models/Report');

  const [presCount, reportCount] = await Promise.all([
    Prescription.countDocuments({ patient: patientId }),
    Report.countDocuments({ patient: patientId })
  ]);

  res.json({
    success: true,
    data: {
      nextAppointment: nextApp ? {
        date: nextApp.appointmentDate,
        time: nextApp.appointmentTime,
        doctor: nextApp.doctor?.name
      } : null,
      appointmentsCount: appointments.length,
      prescriptionsCount: presCount,
      reportsCount: reportCount,
      recentActivity: [
        { type: 'appointment', text: 'Health checkup scheduled', date: new Date() },
        { type: 'report', text: 'Blood test report updated', date: new Date() }
      ]
    }
  });
});

module.exports = {
  createAppointment,
  getAppointments,
  getAppointment,
  updateAppointmentStatus,
  updateAppointment,
  cancelAppointment,
  rescheduleAppointment,
  recommendAppointmentSlots,
  getDashboardStats,
  getPatientStats,
};


