import { emailTransporter } from './config';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    const info = await emailTransporter.sendMail({
      from: `"${process.env.COMPANY_NAME}" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log('Message sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

// Function to generate a random 6-digit verification code
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Function to verify email configuration
export async function verifyEmailConfig() {
  try {
    await emailTransporter.verify();
    return { success: true };
  } catch (error) {
    console.error('Error verifying email configuration:', error);
    return { success: false, error };
  }
}
