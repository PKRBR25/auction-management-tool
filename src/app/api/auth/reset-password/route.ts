import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  console.log('Starting password reset process...');
  try {
    const { email, verificationCode, newPassword } = await req.json();
    console.log('Processing reset for email:', email);

    // Convert verification code to number since our schema uses Int
    const token = parseInt(verificationCode);
    if (isNaN(token)) {
      return NextResponse.json(
        { message: 'Invalid verification code format' },
        { status: 400 }
      );
    }

    // Find user and their latest valid reset token
    console.log('Finding user and valid reset token...');
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        passwordResets: {
          where: {
            token: token,
            tokenExpiresAt: {
              gt: new Date(),
            },
          },
          orderBy: {
            tokenExpiresAt: 'desc',
          },
          take: 1,
        },
      },
    });

    if (!user) {
      console.log('User not found:', email);
      return NextResponse.json(
        { message: 'Invalid email or verification code' },
        { status: 400 }
      );
    }

    if (!user.passwordResets || user.passwordResets.length === 0) {
      console.log('No valid reset token found for user:', email);
      return NextResponse.json(
        { message: 'Invalid or expired verification code' },
        { status: 400 }
      );
    }

    console.log('Valid reset token found, updating password...');
    // Hash new password
    const hashedPassword = await hash(newPassword, 12);

    // Update password and invalidate the reset token
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { hashedPassword },
      }),
      prisma.passwordReset.update({
        where: { id: user.passwordResets[0].id },
        data: { 
          tokenValidUntil: new Date(), // Invalidate token
          tokenLockedUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // Lock for 24 hours
        },
      }),
    ]);

    console.log('Password reset successful for user:', email);
    return NextResponse.json(
      { message: 'Password reset successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reset password error:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    return NextResponse.json(
      { message: 'Failed to reset password. Please try again.' },
      { status: 500 }
    );
  }
}
