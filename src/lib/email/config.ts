import nodemailer from 'nodemailer';

// Create reusable transporter object using SMTP transport
export const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_APP_PASSWORD, // Using app-specific password for security
  },
});
