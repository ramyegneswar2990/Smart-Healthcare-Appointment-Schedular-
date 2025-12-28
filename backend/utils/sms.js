const twilio = require('twilio');

let client;

const getClient = () => {
  if (client) return client;
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    throw new Error('Twilio credentials missing');
  }
  client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  return client;
};

const buildFromNumber = (channel) => {
  if (channel === 'whatsapp') {
    if (!process.env.TWILIO_WHATSAPP_NUMBER) {
      throw new Error('TWILIO_WHATSAPP_NUMBER not configured');
    }
    return `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`;
  }
  if (!process.env.TWILIO_FROM_NUMBER) {
    throw new Error('TWILIO_FROM_NUMBER not configured');
  }
  return process.env.TWILIO_FROM_NUMBER;
};

const buildToNumber = (to, channel) => {
  if (channel === 'whatsapp') {
    return to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
  }
  return to;
};

const sendSMS = async ({ to, body, channel = 'sms' }) => {
  const from = buildFromNumber(channel);
  const formattedTo = buildToNumber(to, channel);
  const twilioClient = getClient();
  return twilioClient.messages.create({
    from,
    to: formattedTo,
    body,
  });
};

module.exports = {
  sendSMS,
};
