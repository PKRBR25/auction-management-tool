import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    console.log('Starting email verification process...');
    const { email, verificationCode } = await req.json();
    console.log('Verifying email:', email);
    console.log('Verification code:', verificationCode);

    // Find user with matching email and verification token
    const user = await prisma.user.findFirst({
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
        { message: 'Invalid or expired verification code' },
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
    } else {
      console.error('Unknown error:', error);
    }
    return NextResponse.json(
      { message: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
