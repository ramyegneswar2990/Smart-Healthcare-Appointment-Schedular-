const express = require('express');
const { body, param, query } = require('express-validator');
const {
  setWeeklyWorkingHours,
  blockUnavailableSlots,
  getAvailableSlotsByDate,
} = require('../controllers/availabilityController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

const timeStringValidator = (field) =>
  body(field)
    .matches(/^\d{2}:\d{2}$/)
    .withMessage(`${field} must be in HH:mm format`);

const workingHoursValidator = [
  body('workingHours').isArray({ min: 1 }).withMessage('workingHours array is required'),
  body('workingHours.*.dayOfWeek')
    .isInt({ min: 0, max: 6 })
    .withMessage('dayOfWeek must be between 0 (Sunday) and 6 (Saturday)'),
  timeStringValidator('workingHours.*.startTime'),
  timeStringValidator('workingHours.*.endTime'),
  body('workingHours.*').custom((range) => {
    if (range.startTime >= range.endTime) {
      throw new Error('startTime must be before endTime');
    }
    return true;
  }),
  body('slotDuration')
    .optional()
    .isInt({ min: 5, max: 180 })
    .withMessage('slotDuration must be between 5 and 180 minutes'),
  body('consultationFee')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('consultationFee must be positive'),
];

const blockSlotsValidator = [
  body('date').isISO8601().withMessage('Valid date is required'),
  body('slots').isArray({ min: 1 }).withMessage('slots array is required'),
  timeStringValidator('slots.*.startTime'),
  timeStringValidator('slots.*.endTime'),
  body('slots.*').custom((slot) => {
    if (slot.startTime >= slot.endTime) {
      throw new Error('slot startTime must be before endTime');
    }
    return true;
  }),
  body('slots.*.reason').optional().isString().trim(),
];

const getSlotsValidator = [
  param('doctorId').isMongoId().withMessage('Valid doctorId is required'),
  query('date').isISO8601().withMessage('date query parameter is required'),
];

router.post('/working-hours', authorize('doctor'), workingHoursValidator, setWeeklyWorkingHours);
router.post('/block', authorize('doctor'), blockSlotsValidator, blockUnavailableSlots);
router.get('/:doctorId', getSlotsValidator, getAvailableSlotsByDate);

module.exports = router;
