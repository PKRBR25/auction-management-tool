import nodemailer from 'nodemailer';

// Create reusable transporter object using SMTP transport
export const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  },
  pool: true, // Use pooled connections
  maxConnections: 5,
  maxMessages: 100,
  rateDelta: 1000, // Minimum time between messages
  rateLimit: 5, // Max messages per rateDelta
});

// Verify email configuration on startup
if (process.env.GMAIL_EMAIL && process.env.GMAIL_APP_PASSWORD) {
  emailTransporter.verify(function (error, success) {
    if (error) {
      console.error('Email configuration error:', error);
    } else {
      console.log('Email server is ready to send messages');
    }
  });
} else {
  console.warn('Email configuration is missing. Emails will not be sent.');
}
