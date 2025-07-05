import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for participant update data
const participantUpdateSchema = z.object({
  name: z.string().min(1, 'Company name is required').optional(),
  email: z.string().email('Invalid email format').optional(),
  contactName: z.string().min(1, 'Contact name is required').optional(),
  phone: z.string().min(1, 'Phone number is required')
    .refine((val) => !isNaN(parseInt(val)), 'Phone number must be numeric')
    .transform((val) => parseInt(val))
    .optional(),
  isActive: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const participant = await prisma.participant.findUnique({
      where: { id },
      include: {
        participantRequests: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!participant) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
    }

    // Convert data to match frontend structure
    const serializedParticipant = {
      id: participant.id,
      name: participant.name,
      email: participant.email,
      contactName: participant.contactName,
      phone: participant.phone.toString(),
      // Use most recent request's active status if available, otherwise use participant's status
      isActive: participant.participantRequests[0]?.isActive ?? participant.isActive
    };
    
    // Add cache control headers
    const response = NextResponse.json(serializedParticipant);
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return response;
  } catch (error) {
    console.error('Error fetching participant:', error);
    return NextResponse.json(
      { error: 'Failed to fetch participant' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = participantUpdateSchema.parse(body);

    // Start a transaction to update both participant and create request
    const updatedParticipant = await prisma.$transaction(async (tx) => {
      // Update participant
      const participant = await prisma.participant.update({
        where: { id },
        data: {
          ...validatedData,
          updatedAt: new Date(),
          ...(validatedData.isActive !== undefined && {
            activeSince: new Date(),
          }),
        },
      });

      // Create new participant request
      await prisma.participantRequest.create({
        data: {
          participantId: id,
          isActive: validatedData.isActive ?? participant.isActive,
        },
      });

      return participant;
    });

    // Convert BigInt to string for JSON serialization
    const serializedParticipant = {
      ...updatedParticipant,
      phone: updatedParticipant.phone.toString()
    };
    return NextResponse.json(serializedParticipant);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid participant data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating participant:', error);
    return NextResponse.json(
      { error: 'Failed to update participant' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    // Soft delete by updating isActive to false
    await prisma.$transaction(async (prisma) => {
      await prisma.participant.update({
        where: { id },
        data: {
          isActive: false,
          updatedAt: new Date(),
        },
      });

      await prisma.participantRequest.create({
        data: {
          participantId: id,
          isActive: false,
        },
      });
    });

    return NextResponse.json({ message: 'Participant deleted successfully' });
  } catch (error) {
    console.error('Error deleting participant:', error);
    return NextResponse.json(
      { error: 'Failed to delete participant' },
      { status: 500 }
    );
  }
}
