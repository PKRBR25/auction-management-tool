import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    console.log('Starting email verification process...');
    const { email, verificationCode } = await req.json();
    
    if (!email || !verificationCode) {
      console.log('Missing required fields');
      return NextResponse.json(
        { message: 'Email and verification code are required' },
        { status: 400 }
      );
    }

    console.log('Verifying email:', email);
    console.log('Verification code:', verificationCode);

    // Find user with matching email and verification token
    const user = await prisma.user.findFirst({
      select: {
        id: true,
        email: true,
        verificationToken: true,
        verificationTokenExpires: true,
        isVerified: true
      },
      where: {
        email,
        verificationToken: verificationCode,
        verificationTokenExpires: {
          gt: new Date(),
        },
        isVerified: false,
      },
    });

    if (!user) {
      console.log('No user found with matching verification code');
      return NextResponse.json(
        { message: 'Invalid or expired verification code. Please request a new verification code.' },
        { status: 400 }
      );
    }

    if (user.isVerified) {
      console.log('User already verified');
      return NextResponse.json(
        { message: 'Email is already verified. Please proceed to login.' },
        { status: 400 }
      );
    }

    if (user.verificationTokenExpires && user.verificationTokenExpires < new Date()) {
      console.log('Verification code expired');
      return NextResponse.json(
        { message: 'Verification code has expired. Please request a new one.' },
        { status: 400 }
      );
    }
    console.log('Found user:', user.id);

    // Update user as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verifiedSince: new Date(),
        verificationToken: null,
        verificationTokenExpires: null,
      },
    });

    return NextResponse.json(
      { message: 'Email verified successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Email verification error:');
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      // Check for specific Prisma errors
      if (error.name === 'PrismaClientKnownRequestError') {
        return NextResponse.json(
          { message: 'Database error occurred. Please try again later.' },
          { status: 500 }
        );
      }
    } else {
      console.error('Unknown error:', error);
    }
    
    return NextResponse.json(
      { 
        message: 'Failed to verify email. Please try again or contact support if the issue persists.',
        error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
      },
      { status: 500 }
    );
  }
}
