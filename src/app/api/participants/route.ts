import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for participant data
const participantSchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  email: z.string().email('Invalid email format'),
  contactName: z.string().min(1, 'Contact name is required'),
  phone: z.string().min(1, 'Phone number is required').refine(
    (val) => !isNaN(parseInt(val)),
    'Phone number must be numeric'
  ).transform((val) => parseInt(val)),
});

export async function GET() {
  let session;

  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all active participants
    const participants = await prisma.participant.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    // Convert BigInt to string for JSON serialization
    const serializedParticipants = participants.map(participant => ({
      ...participant,
      phone: participant.phone.toString()
    }));
    return NextResponse.json(serializedParticipants);
  } catch (error) {
    console.error('Error fetching participants:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      session: session ? 'Session exists' : 'No session'
    });
    return NextResponse.json(
      { error: 'Failed to fetch participants' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  console.log('Starting POST request to /api/participants');
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Received body:', body);

    // Validate input data
    const validatedData = participantSchema.parse(body);
    console.log('Validated data:', validatedData);

    // Create participant
    const participant = await prisma.participant.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        contactName: validatedData.contactName,
        phone: validatedData.phone,
        participantRequests: {
          create: {
            isActive: true,
          },
        },
      },
    });

    // Convert BigInt to string for JSON serialization
    const serializedParticipant = {
      ...participant,
      phone: participant.phone.toString()
    };
    return NextResponse.json(serializedParticipant, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors);
      return NextResponse.json(
        { error: 'Invalid participant data', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      console.error('Error creating participant:', {
        message: error.message,
        stack: error.stack
      });
      return NextResponse.json(
        { error: error.message || 'Failed to create participant' },
        { status: 500 }
      );
    }

    console.error('Unknown error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
