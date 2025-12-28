const express = require('express');
const { body } = require('express-validator');
const {
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
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Validation rules
const timeStringValidator = (field) =>
  body(field)
    .matches(/^\d{2}:\d{2}$/)
    .withMessage(`${field} must be in HH:mm format`);

const createAppointmentValidation = [
  body('doctor').isMongoId().withMessage('Valid doctor ID is required'),
  body('appointmentDate').isISO8601().withMessage('Valid appointment date is required'),
  timeStringValidator('appointmentTime'),
  body('reason').optional().trim(),
  body('duration').optional().isInt({ min: 15 }).withMessage('Duration must be at least 15 minutes'),
];

const updateStatusValidation = [
  body('status').isIn(['booked', 'pending', 'confirmed', 'cancelled', 'completed']).withMessage('Invalid status'),
];

const cancelValidation = [
  body('reason').optional().isString().trim(),
];

const rescheduleValidation = [
  body('appointmentDate').isISO8601().withMessage('Valid appointment date is required'),
  timeStringValidator('appointmentTime'),
];

const recommendationValidation = [
  body('doctorId').isMongoId().withMessage('doctorId is required'),
  body('preferences').optional().isObject(),
  body('preferences.startDate')
    .optional()
    .isISO8601()
    .withMessage('preferences.startDate must be a valid date'),
];

router.get('/stats', authorize('doctor'), getDashboardStats);
router.get('/patient-stats', authorize('patient'), getPatientStats);

router
  .route('/')
  .get(getAppointments)
  .post(authorize('patient'), createAppointmentValidation, createAppointment);

router
  .route('/:id')
  .get(getAppointment)
  .put(updateAppointment);

router
  .route('/:id/status')
  .patch(updateStatusValidation, updateAppointmentStatus);

router.post('/:id/cancel', cancelValidation, cancelAppointment);
router.post('/:id/reschedule', rescheduleValidation, rescheduleAppointment);
router.post(
  '/recommendations',
  authorize('patient'),
  recommendationValidation,
  recommendAppointmentSlots
);

module.exports = router;

