import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateVerificationCode } from '@/lib/email/service';
import { getPasswordResetEmailTemplate } from '@/lib/email/templates/password-reset';
import { sendEmail } from '@/lib/email/service';

export async function POST(req: Request) {
  console.log('Starting password reset process...');
  try {
    // Log environment variables (excluding sensitive data)
    console.log('Environment check:', {
      GMAIL_EMAIL: process.env.GMAIL_EMAIL ? '✓ Set' : '✗ Missing',
      GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD ? '✓ Set' : '✗ Missing',
      COMPANY_NAME: process.env.COMPANY_NAME ? '✓ Set' : '✗ Missing',
      NODE_ENV: process.env.NODE_ENV
    });

    console.log('Parsing request body...');
    const { email } = await req.json();
    console.log('Email received:', email);

    // Validate environment variables
    if (!process.env.GMAIL_EMAIL || !process.env.GMAIL_APP_PASSWORD) {
      const error = 'Missing email configuration: ' + 
        (!process.env.GMAIL_EMAIL ? 'GMAIL_EMAIL ' : '') +
        (!process.env.GMAIL_APP_PASSWORD ? 'GMAIL_APP_PASSWORD' : '');
      console.error(error);
      return NextResponse.json(
        { message: 'Server configuration error: Email service not properly configured' },
        { status: 500 }
      );
    }

    console.log('Finding user by email...');
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log('User not found:', email);
      return NextResponse.json(
        { message: 'If the email exists, you will receive reset instructions' },
        { status: 200 }
      );
    }

    console.log('Generating reset code...');
    // Generate reset code (convert to number since our schema expects Int)
    const resetCode = parseInt(generateVerificationCode());
    console.log('Reset code generated:', resetCode);

    console.log('Creating password reset record...');
    // Create password reset record
    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token: resetCode,
        tokenExpiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      },
    });
    console.log('Password reset record created');

    console.log('Generating email template...');
    // Send password reset email
    console.log('Generating email template...');
    const templateParams = {
      userFullName: user.fullName || email.split('@')[0],
      verificationCode: resetCode.toString(),
      companyName: process.env.COMPANY_NAME || 'Our Company',
      companyAddressLine1: process.env.COMPANY_ADDRESS_LINE1 || '123 Main St',
      companyAddressLine2: process.env.COMPANY_ADDRESS_LINE2 || 'Suite 100, City, State 12345',
      currentYear: new Date().getFullYear().toString(),
      privacyPolicyUrl: process.env.PRIVACY_POLICY_URL || '#',
      termsUrl: process.env.TERMS_URL || '#',
      unsubscribeUrl: process.env.UNSUBSCRIBE_URL || '#',
      preferencesUrl: process.env.PREFERENCES_URL || '#',
    };
    console.log('Template parameters:', templateParams);
    
    const emailTemplate = getPasswordResetEmailTemplate(templateParams);
    console.log('Email template generated successfully');

    console.log('Sending password reset email...');
    const emailResult = await sendEmail({
      to: email,
      subject: 'Reset your password',
      html: emailTemplate,
    });

    if (!emailResult.success) {
      console.error('Failed to send password reset email:', {
        error: emailResult.error,
        messageId: emailResult.messageId
      });
      return NextResponse.json(
        { 
          message: 'Failed to send password reset email. ' + 
                  (emailResult.error || 'Please check email configuration.') 
        },
        { status: 500 }
      );
    }

    console.log('Password reset email sent successfully');
    return NextResponse.json({ message: 'If the email exists, you will receive reset instructions' });
  } catch (error) {
    console.error('Password reset error:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    return NextResponse.json(
      { 
        message: 'An unexpected error occurred: ' + 
                (error instanceof Error ? error.message : 'Unknown error') 
      },
      { status: 500 }
    );
  }
}
