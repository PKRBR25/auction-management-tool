import { emailTransporter } from './config';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: any;
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<SendEmailResult> {
  try {
    // Validate email configuration
    if (!process.env.GMAIL_EMAIL || !process.env.GMAIL_APP_PASSWORD) {
      const missingVars = [];
      if (!process.env.GMAIL_EMAIL) missingVars.push('GMAIL_EMAIL');
      if (!process.env.GMAIL_APP_PASSWORD) missingVars.push('GMAIL_APP_PASSWORD');
      
      const error = `Missing email configuration: ${missingVars.join(', ')}`;
      console.error(error);
      return { success: false, error };
    }

    // Validate email address
    if (!to || typeof to !== 'string' || !to.includes('@')) {
      const error = 'Invalid recipient email address';
      console.error(error, { to });
      return { success: false, error };
    }

    console.log('Email service configuration:', {
      service: 'gmail',
      user: process.env.GMAIL_EMAIL,
      transporterReady: emailTransporter ? '✓' : '✗',
      hasAuth: emailTransporter?.options?.auth ? '✓' : '✗'
    });

    // Prepare email data
    const companyName = process.env.COMPANY_NAME || 'Auction Management Tool';
    const from = `"${companyName}" <${process.env.GMAIL_EMAIL}>`;
    
    console.log('Preparing email:', {
      from,
      to,
      subject,
      htmlLength: html?.length || 0
    });

    // Verify transporter before sending
    await emailTransporter.verify();
    console.log('Email transporter verified successfully');

    // Send email
    const info = await emailTransporter.sendMail({
      from,
      to,
      subject,
      html,
    });

    console.log('Email sent successfully:', {
      messageId: info.messageId,
      response: info.response,
      accepted: info.accepted,
      rejected: info.rejected
    });

    return { 
      success: true, 
      messageId: info.messageId,
      response: info.response 
    };
  } catch (error) {
    console.error('Email sending failed:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      code: (error as any)?.code,
      command: (error as any)?.command,
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });

    let errorMessage = 'Failed to send email';
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        errorMessage = 'Could not connect to email server';
      } else if (error.message.includes('Invalid login')) {
        errorMessage = 'Invalid email credentials';
      } else if (error.message.includes('CERT_HAS_EXPIRED')) {
        errorMessage = 'Email server certificate error';
      }
    }

    return { 
      success: false, 
      error: errorMessage,
      details: error instanceof Error ? error.message : String(error)
    };
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
