const Availability = require('../models/Availability');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { recommendAppointmentSlots } = require('./aiRecommendationService');

const ACTIVE_STATUSES = ['booked', 'confirmed'];

const getDateRange = (startDate, days = 7) => {
  const start = new Date(startDate);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + days);
  return { start, end };
};

const formatDate = (date) => {
  const dt = new Date(date);
  dt.setUTCHours(0, 0, 0, 0);
  return dt.toISOString().split('T')[0];
};

const buildWeekAvailability = async (doctorId, startDate) => {
  const { start, end } = getDateRange(startDate);
  const [availabilityDocs, appointments] = await Promise.all([
    Availability.find({
      doctor: doctorId,
      date: { $gte: start, $lt: end },
    }).lean(),
    Appointment.find({
      doctor: doctorId,
      appointmentDate: { $gte: start, $lt: end },
      status: { $in: ACTIVE_STATUSES },
    })
      .select('appointmentDate appointmentTime status')
      .lean(),
  ]);

  const availabilityMap = new Map();
  availabilityDocs.forEach((record) => {
    availabilityMap.set(formatDate(record.date), record.timeSlots || []);
  });

  const bookedMap = new Map();
  appointments.forEach((appt) => {
    const key = formatDate(appt.appointmentDate);
    if (!bookedMap.has(key)) {
      bookedMap.set(key, new Set());
    }
    bookedMap.get(key).add(appt.appointmentTime);
  });

  const results = [];
  for (let i = 0; i < 7; i += 1) {
    const current = new Date(start);
    current.setUTCDate(start.getUTCDate() + i);
    const key = formatDate(current);
    const slots = availabilityMap.get(key) || [];
    const booked = bookedMap.get(key) || new Set();

    results.push({
      date: key,
      availableSlots: slots
        .filter((slot) => slot.status === 'available')
        .map((slot) => ({
          startTime: slot.startTime,
          endTime: slot.endTime,
        })),
      blockedSlots: slots
        .filter((slot) => slot.status === 'blocked')
        .map((slot) => ({
          startTime: slot.startTime,
          endTime: slot.endTime,
          reason: slot.reason,
        })),
      bookedSlots: Array.from(booked),
    });
  }

  return results;
};

const buildHistory = async (patientId, doctorId, limit = 5) => {
  const history = await Appointment.find({
    patient: patientId,
    doctor: doctorId,
  })
    .sort({ appointmentDate: -1 })
    .limit(limit)
    .select('appointmentDate appointmentTime status')
    .lean();

  return history.map((record) => ({
    date: formatDate(record.appointmentDate),
    time: record.appointmentTime,
    status: record.status,
  }));
};

const calculateCancellationRate = async (doctorId, lookbackDays = 30) => {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - lookbackDays);

  const appointments = await Appointment.find({
    doctor: doctorId,
    appointmentDate: { $gte: since },
  })
    .select('status')
    .lean();

  if (appointments.length === 0) {
    return 0;
  }

  const cancelled = appointments.filter((appt) => appt.status === 'cancelled').length;
  return Number((cancelled / appointments.length).toFixed(2));
};

const recommendSlots = async ({ doctorId, patientId, preferences = {} }) => {
  const doctor = await User.findById(doctorId).select('name role specialization');
  if (!doctor || doctor.role !== 'doctor') {
    throw new Error('Doctor not found');
  }

  const startDate = preferences.startDate ? new Date(preferences.startDate) : new Date();

  const [weekAvailability, history, cancellationRate] = await Promise.all([
    buildWeekAvailability(doctorId, startDate),
    buildHistory(patientId, doctorId),
    calculateCancellationRate(doctorId),
  ]);

  const recommendations = await recommendAppointmentSlots({
    doctor: {
      id: doctor._id,
      name: doctor.name,
      specialization: doctor.specialization,
    },
    weekAvailability,
    patientPreferences: preferences,
    history,
    cancellationRate,
  });

  return recommendations;
};

module.exports = {
  recommendSlots,
};
