import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { generateVerificationCode } from '@/lib/email/service';
import { getVerificationEmailTemplate } from '@/lib/email/templates/verification';
import { sendEmail } from '@/lib/email/service';

export async function POST(req: Request) {
  console.log('Starting registration process...');
  try {
    console.log('Parsing request body...');
    const { email, password } = await req.json();
    console.log('Email received:', email);

    console.log('Checking for existing user...');
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 400 }
      );
    }

    console.log('Hashing password...');
    // Hash password
    const hashedPassword = await hash(password, 12);

    console.log('Generating verification code...');
    // Generate verification code
    const verificationCode = generateVerificationCode();
    console.log('Verification code generated:', verificationCode);

    console.log('Creating user in database...');
    // Create user with verification token
    const user = await prisma.user.create({
      data: {
        email,
        hashedPassword,
        verificationToken: verificationCode,
        verificationTokenExpires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      },
    });

    console.log('Generating email template...');
    // Send verification email
    const emailTemplate = getVerificationEmailTemplate({
      userFullName: email.split('@')[0], // Using email prefix as name
      verificationCode: verificationCode,
      companyName: process.env.COMPANY_NAME || '',
      companyAddressLine1: process.env.COMPANY_ADDRESS_LINE1 || '',
      companyAddressLine2: process.env.COMPANY_ADDRESS_LINE2 || '',
      currentYear: new Date().getFullYear().toString(),
      privacyPolicyUrl: process.env.PRIVACY_POLICY_URL || '',
      termsUrl: process.env.TERMS_URL || '',
      unsubscribeUrl: process.env.UNSUBSCRIBE_URL || '',
      preferencesUrl: process.env.PREFERENCES_URL || '',
    });

    console.log('Sending verification email...');
    const emailResult = await sendEmail({
      to: email,
      subject: 'Verify your email address',
      html: emailTemplate,
    });

    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error);
      return NextResponse.json(
        { message: 'User created but failed to send verification email' },
        { status: 500 }
      );
    }

    console.log('Verification email sent successfully');

    return NextResponse.json(
      { message: 'User created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    
    // Check for missing environment variables
    const requiredEnvVars = [
      'SMTP_USER',
      'SMTP_APP_PASSWORD',
      'COMPANY_NAME',
      'COMPANY_ADDRESS_LINE1',
      'COMPANY_ADDRESS_LINE2',
      'PRIVACY_POLICY_URL',
      'TERMS_URL',
      'UNSUBSCRIBE_URL',
      'PREFERENCES_URL'
    ];

    const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingEnvVars.length > 0) {
      console.error('Missing environment variables:', missingEnvVars);
      return NextResponse.json(
        { message: 'Server configuration error: Missing environment variables', details: missingEnvVars },
        { status: 500 }
      );
    }

    // If it's a Prisma error, return more specific message
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      return NextResponse.json(
        { message: 'Registration failed', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
