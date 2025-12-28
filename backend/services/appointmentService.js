const Appointment = require('../models/Appointment');
const Availability = require('../models/Availability');
const User = require('../models/User');
const { startSession } = require('mongoose');
const { createNotificationEntries } = require('./notificationService');

const ACTIVE_STATUSES = ['booked', 'confirmed'];

const normalizeDate = (dateInput) => {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid appointment date');
  }
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

const ensureDoctor = async (doctorId) => {
  const doctorUser = await User.findById(doctorId);
  if (!doctorUser || doctorUser.role !== 'doctor') {
    throw new Error('Invalid doctor');
  }
  return doctorUser;
};

const isSlotBlocked = async (doctorId, appointmentDate, appointmentTime, session) => {
  const availability = await Availability.findOne(
    {
      doctor: doctorId,
      date: normalizeDate(appointmentDate),
      'timeSlots.startTime': appointmentTime,
    },
    { 'timeSlots.$': 1 },
    { session }
  );

  if (!availability) {
    return false;
  }

  const slot = availability.timeSlots[0];
  return slot?.status === 'blocked';
};

const findConflictingAppointment = async (doctorId, appointmentDate, appointmentTime, excludeId) => {
  const query = {
    doctor: doctorId,
    appointmentDate: normalizeDate(appointmentDate),
    appointmentTime,
    status: { $in: ACTIVE_STATUSES },
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  return Appointment.findOne(query);
};

const patientHasConflict = async (patientId, appointmentDate, appointmentTime, excludeId) => {
  const query = {
    patient: patientId,
    appointmentDate: normalizeDate(appointmentDate),
    appointmentTime,
    status: { $in: ACTIVE_STATUSES },
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  return Appointment.findOne(query);
};

const createAppointment = async (appointmentData) => {
  const session = await startSession();
  session.startTransaction();

  try {
    const { patient, doctor, appointmentDate, appointmentTime, reason, duration } = appointmentData;

    await ensureDoctor(doctor);

    if (await isSlotBlocked(doctor, appointmentDate, appointmentTime, session)) {
      throw new Error('This time slot has been blocked by the doctor');
    }

    const conflictingAppointment = await findConflictingAppointment(
      doctor,
      appointmentDate,
      appointmentTime
    );

    if (conflictingAppointment) {
      throw new Error('Appointment slot already booked');
    }

    const patientConflict = await patientHasConflict(
      patient,
      appointmentDate,
      appointmentTime
    );

    if (patientConflict) {
      throw new Error('Patient already has an appointment at this time');
    }

    const appointment = await Appointment.create(
      [
        {
          patient,
          doctor,
          appointmentDate: normalizeDate(appointmentDate),
          appointmentTime,
          reason,
          duration: duration || 30,
          status: 'booked',
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    const populatedAppointment = await Appointment.findById(appointment[0]._id)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email specialization');

    await createNotificationEntries({ appointment: populatedAppointment, type: 'booking' });

    return populatedAppointment;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    // Handle duplicate key error from partial unique index
    if (error.code === 11000) {
      throw new Error('Appointment slot already booked');
    }

    throw error;
  }
};

const getAppointmentsByUser = async (userId, role) => {
  const query = role === 'doctor' ? { doctor: userId } : { patient: userId };
  
  return await Appointment.find(query)
    .populate('patient', 'name email phone')
    .populate('doctor', 'name email specialization')
    .sort({ appointmentDate: 1, appointmentTime: 1 });
};

const getAppointmentById = async (appointmentId, userId, role) => {
  const query = { _id: appointmentId };
  if (role === 'doctor') {
    query.doctor = userId;
  } else {
    query.patient = userId;
  }

  const appointment = await Appointment.findOne(query)
    .populate('patient', 'name email phone dateOfBirth')
    .populate('doctor', 'name email specialization licenseNumber');

  if (!appointment) {
    throw new Error('Appointment not found');
  }

  return appointment;
};

const updateAppointmentStatus = async (appointmentId, status, userId, role) => {
  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    throw new Error('Appointment not found');
  }

  // Verify ownership
  if (role === 'doctor' && appointment.doctor.toString() !== userId.toString()) {
    throw new Error('Not authorized');
  }
  if (role === 'patient' && appointment.patient.toString() !== userId.toString()) {
    throw new Error('Not authorized');
  }

  appointment.status = status;
  await appointment.save();

  return await Appointment.findById(appointment._id)
    .populate('patient', 'name email phone')
    .populate('doctor', 'name email specialization');
};

const updateAppointment = async (appointmentId, updateData, userId, role) => {
  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    throw new Error('Appointment not found');
  }

  // Verify ownership
  if (role === 'doctor' && appointment.doctor.toString() !== userId.toString()) {
    throw new Error('Not authorized');
  }
  if (role === 'patient' && appointment.patient.toString() !== userId.toString()) {
    throw new Error('Not authorized');
  }

  // Only allow status updates for cancelled appointments
  if (appointment.status === 'cancelled') {
    throw new Error('Cannot update cancelled appointment');
  }

  Object.assign(appointment, updateData);
  await appointment.save();

  return await Appointment.findById(appointment._id)
    .populate('patient', 'name email phone')
    .populate('doctor', 'name email specialization');
};

const cancelAppointment = async (appointmentId, userId, role, cancelReason, opts = { releaseSlot: true }) => {
  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    throw new Error('Appointment not found');
  }

  if (
    appointment.patient.toString() !== userId.toString() &&
    appointment.doctor.toString() !== userId.toString()
  ) {
    throw new Error('Not authorized to cancel this appointment');
  }

  if (appointment.status === 'cancelled') {
    return Appointment.findById(appointmentId)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email specialization');
  }

  appointment.status = 'cancelled';
  if (cancelReason) {
    appointment.notes = cancelReason;
  }
  await appointment.save();

  if (opts.releaseSlot) {
    await Availability.updateOne(
      {
        doctor: appointment.doctor,
        date: normalizeDate(appointment.appointmentDate),
        'timeSlots.startTime': appointment.appointmentTime,
      },
      {
        $set: { 'timeSlots.$.status': 'available', 'timeSlots.$.reason': null },
      }
    );
  }

};

const rescheduleAppointment = async (
  appointmentId,
  userId,
  role,
  { appointmentDate, appointmentTime }
) => {
  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    throw new Error('Appointment not found');
  }

  if (
    appointment.patient.toString() !== userId.toString() &&
    appointment.doctor.toString() !== userId.toString()
  ) {
    throw new Error('Not authorized to reschedule this appointment');
  }

  if (appointment.status === 'cancelled') {
    throw new Error('Cannot reschedule a cancelled appointment');
  }

  await ensureDoctor(appointment.doctor);

  if (await isSlotBlocked(appointment.doctor, appointmentDate, appointmentTime)) {
    throw new Error('This time slot has been blocked by the doctor');
  }

  const conflictingAppointment = await findConflictingAppointment(
    appointment.doctor,
    appointmentDate,
    appointmentTime,
    appointment._id
  );

  if (conflictingAppointment) {
    throw new Error('Appointment slot already booked');
  }

  const patientConflict = await patientHasConflict(
    appointment.patient,
    appointmentDate,
    appointmentTime,
    appointment._id
  );

  if (patientConflict) {
    throw new Error('Patient already has an appointment at this time');
  }

  appointment.appointmentDate = normalizeDate(appointmentDate);
  appointment.appointmentTime = appointmentTime;
  appointment.status = 'booked';
  await appointment.save();

  const populatedAppointment = await Appointment.findById(appointment._id)
    .populate('patient', 'name email phone')
    .populate('doctor', 'name email specialization');

  await createNotificationEntries({ appointment: populatedAppointment, type: 'booking' });

  return populatedAppointment;
};

module.exports = {
  createAppointment,
  getAppointmentsByUser,
  getAppointmentById,
  updateAppointmentStatus,
  updateAppointment,
  cancelAppointment,
  rescheduleAppointment,
};

