const Notification = require('../models/Notification');
const Appointment = require('../models/Appointment');
const { sendEmail } = require('../utils/email');
const { sendSMS } = require('../utils/sms');

const formatAppointmentDetails = (appointment) => {
  const date = new Date(appointment.appointmentDate).toLocaleDateString();
  return `${date} at ${appointment.appointmentTime}`;
};

const createNotificationEntries = async ({ appointment, type }) => {
  const populatedAppointment =
    appointment instanceof Appointment
      ? appointment
      : await Appointment.findById(appointment)
          .populate('patient', 'name email phone')
          .populate('doctor', 'name email phone');

  if (!populatedAppointment) {
    throw new Error('Appointment not found for notification');
  }

  const notifications = [];
  const participants = [
    {
      user: populatedAppointment.patient,
      channels: ['email', 'sms', 'whatsapp'],
    },
    {
      user: populatedAppointment.doctor,
      channels: ['email', 'sms'],
    },
  ];

  for (const participant of participants) {
    const { user, channels } = participant;
    if (!user) continue;

    const basePayload = {
      user: user._id,
      appointment: populatedAppointment._id,
      type,
      scheduledFor: new Date(),
    };

    if (channels.includes('email') && user.email) {
      notifications.push({
        ...basePayload,
        channel: 'email',
        subject: `Appointment ${type}`,
        message: `Hello ${user.name},\n\nYour appointment on ${formatAppointmentDetails(
          populatedAppointment
        )} has a new status: ${type}.\n\nThank you.`,
        meta: { email: user.email },
      });
    }

    if (channels.includes('sms') && user.phone) {
      notifications.push({
        ...basePayload,
        channel: 'sms',
        message: `Appointment ${type}: ${formatAppointmentDetails(populatedAppointment)}`,
        meta: { phone: user.phone },
      });
    }

    if (channels.includes('whatsapp') && user.phone) {
      notifications.push({
        ...basePayload,
        channel: 'whatsapp',
        message: `WhatsApp notice: Appointment ${formatAppointmentDetails(populatedAppointment)} (${type})`,
        meta: { phone: user.phone },
      });
    }
  }

  if (type === 'booking') {
    const reminderDate = new Date(populatedAppointment.appointmentDate);
    reminderDate.setHours(reminderDate.getHours() - 24);
    if (reminderDate > new Date()) {
      notifications.push({
        user: populatedAppointment.patient._id,
        appointment: populatedAppointment._id,
        channel: 'whatsapp',
        type: 'reminder',
        message: `Reminder: Appointment ${formatAppointmentDetails(populatedAppointment)} in 24h`,
        scheduledFor: reminderDate,
        meta: { phone: populatedAppointment.patient.phone },
      });
    }
  }

  return Notification.insertMany(notifications);
};

const processNotification = async (notification) => {
  try {
    if (notification.channel === 'email') {
      await sendEmail({
        to: notification.meta?.email || notification.user?.email,
        subject: notification.subject,
        text: notification.message,
      });
    } else if (notification.channel === 'sms') {
      await sendSMS({
        to: notification.meta?.phone || notification.user?.phone,
        body: notification.message,
      });
    }

    notification.status = 'sent';
    notification.sentAt = new Date();
  } catch (error) {
    notification.status = 'failed';
    notification.error = error.message;
  }

  await notification.save();
};

module.exports = {
  createNotificationEntries,
  processNotification,
};
