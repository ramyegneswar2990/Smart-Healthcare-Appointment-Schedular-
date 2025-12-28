const { validationResult } = require('express-validator');
const asyncHandler = require('../utils/asyncHandler');
const DoctorProfile = require('../models/DoctorProfile');
const Availability = require('../models/Availability');
const Appointment = require('../models/Appointment');
const appointmentService = require('../services/appointmentService');

const toMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

const toTimeString = (minutes) => {
  const hrs = String(Math.floor(minutes / 60)).padStart(2, '0');
  const mins = String(minutes % 60).padStart(2, '0');
  return `${hrs}:${mins}`;
};

const normalizeDate = (dateStr) => {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid date provided');
  }
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

const buildSlots = (workingHours, slotDuration) => {
  const slots = [];
  workingHours.forEach((range) => {
    let cursor = toMinutes(range.startTime);
    const end = toMinutes(range.endTime);
    while (cursor + slotDuration <= end) {
      const startTime = toTimeString(cursor);
      const endTime = toTimeString(cursor + slotDuration);
      slots.push({ startTime, endTime });
      cursor += slotDuration;
    }
  });
  return slots;
};

// @desc    Set doctor weekly working hours
// @route   POST /api/availability/working-hours
// @access  Private (Doctor)
const setWeeklyWorkingHours = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { workingHours, slotDuration, consultationFee } = req.body;

  const profile = await DoctorProfile.findOneAndUpdate(
    { user: req.user._id },
    {
      $set: {
        workingHours,
        ...(slotDuration && { slotDuration }),
        ...(consultationFee !== undefined && { consultationFee }),
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  res.json({
    success: true,
    data: profile,
  });
});

// @desc    Block unavailable slots for specific date
// @route   POST /api/availability/block
// @access  Private (Doctor)
const blockUnavailableSlots = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { date, slots } = req.body;
  const normalizedDate = normalizeDate(date);

  let availability =
    (await Availability.findOne({ doctor: req.user._id, date: normalizedDate })) ||
    new Availability({ doctor: req.user._id, date: normalizedDate, timeSlots: [] });

  slots.forEach(({ startTime, endTime, reason }) => {
    const existingSlot = availability.timeSlots.find(
      (slot) => slot.startTime === startTime && slot.endTime === endTime
    );

    if (existingSlot) {
      existingSlot.status = 'blocked';
      existingSlot.reason = reason || existingSlot.reason;
    } else {
      availability.timeSlots.push({
        startTime,
        endTime,
        status: 'blocked',
        reason,
      });
    }
  });

  await availability.save();

  res.json({
    success: true,
    data: availability,
  });
});

// @desc    Emergency block: block slots + cancel overlapping appointments
// @route   POST /api/availability/emergency-block
// @access  Private (Doctor)
const emergencyBlockSlots = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { date, slots, reason } = req.body;
  const normalizedDate = normalizeDate(date);

  if (!slots?.length) {
    return res.status(400).json({ message: 'At least one slot is required' });
  }

  let availability =
    (await Availability.findOne({ doctor: req.user._id, date: normalizedDate })) ||
    new Availability({ doctor: req.user._id, date: normalizedDate, timeSlots: [] });

  slots.forEach(({ startTime, endTime }) => {
    const existingSlot = availability.timeSlots.find(
      (slot) => slot.startTime === startTime && slot.endTime === endTime
    );

    if (existingSlot) {
      existingSlot.status = 'blocked';
      existingSlot.reason = reason || existingSlot.reason || 'Doctor emergency';
    } else {
      availability.timeSlots.push({
        startTime,
        endTime,
        status: 'blocked',
        reason: reason || 'Doctor emergency',
      });
    }
  });

  await availability.save();

  const slotTimes = slots.map((slot) => slot.startTime);
  const activeAppointments = await Appointment.find({
    doctor: req.user._id,
    appointmentDate: normalizedDate,
    appointmentTime: { $in: slotTimes },
    status: { $in: ['booked', 'confirmed'] },
  }).select('_id');

  await Promise.all(
    activeAppointments.map((appt) =>
      appointmentService.cancelAppointment(
        appt._id,
        req.user._id,
        'doctor',
        reason || 'Doctor emergency',
        { releaseSlot: false }
      )
    )
  );

  res.json({
    success: true,
    data: availability,
    cancelledAppointments: activeAppointments.length,
  });
});

// @desc    Fetch available slots for doctor by date
// @route   GET /api/availability/:doctorId
// @access  Private
const getAvailableSlotsByDate = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { doctorId } = req.params;
  const { date } = req.query;
  const normalizedDate = normalizeDate(date);

  const doctorProfile = await DoctorProfile.findOne({ user: doctorId });
  if (!doctorProfile || !doctorProfile.workingHours || doctorProfile.workingHours.length === 0) {
    return res.json({ success: true, data: [] });
  }

  const dayOfWeek = normalizedDate.getUTCDay();
  const dayHours = doctorProfile.workingHours.filter((range) => range.dayOfWeek === dayOfWeek);

  if (dayHours.length === 0) {
    return res.json({ success: true, data: [] });
  }

  const slotDuration = doctorProfile.slotDuration || 30;
  const baseSlots = buildSlots(dayHours, slotDuration);

  const startOfDay = new Date(normalizedDate);
  const endOfDay = new Date(normalizedDate);
  endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

  const appointments = await Appointment.find({
    doctor: doctorId,
    appointmentDate: { $gte: startOfDay, $lt: endOfDay },
    status: { $in: ['pending', 'confirmed'] },
  }).select('appointmentTime');

  const bookedTimes = new Set(appointments.map((appointment) => appointment.appointmentTime));

  const availability = await Availability.findOne({ doctor: doctorId, date: normalizedDate });
  const blockedTimes = new Set(
    (availability?.timeSlots || [])
      .filter((slot) => slot.status === 'blocked')
      .map((slot) => slot.startTime)
  );

  const availableSlots = baseSlots.filter(
    (slot) => !bookedTimes.has(slot.startTime) && !blockedTimes.has(slot.startTime)
  );

  res.json({
    success: true,
    data: availableSlots,
  });
});

module.exports = {
  setWeeklyWorkingHours,
  blockUnavailableSlots,
  emergencyBlockSlots,
  getAvailableSlotsByDate,
};
