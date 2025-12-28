const cron = require('node-cron');
const Notification = require('../models/Notification');
const { processNotification } = require('../services/notificationService');

const startNotificationWorker = () => {
  cron.schedule('* * * * *', async () => {
    const pendingNotifications = await Notification.find({
      status: 'pending',
      scheduledFor: { $lte: new Date() },
    })
      .limit(20)
      .populate('user', 'email phone');

    for (const notification of pendingNotifications) {
      await processNotification(notification);
    }
  });
};

module.exports = {
  startNotificationWorker,
};
