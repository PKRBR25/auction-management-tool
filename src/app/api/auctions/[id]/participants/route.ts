import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Schema for participant IDs
const participantsSchema = z.object({
  participantIds: z.array(z.number())
});

export async function POST(request: Request, context: { params: { id: string } }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get auction ID from params
    const id = await Promise.resolve(context.params.id);
    if (!id) {
      return NextResponse.json({ error: 'Auction ID is required' }, { status: 400 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = participantsSchema.safeParse(body);
    
    if (!validatedData.success) {
      console.error('Validation error:', validatedData.error);
      return NextResponse.json({ 
        error: 'Invalid request data', 
        details: validatedData.error.errors 
      }, { status: 400 });
    }

    const { participantIds } = validatedData.data;

    // Verify auction exists
    const auction = await prisma.auctionRequest.findUnique({
      where: { id: parseInt(id) }
    });

    if (!auction) {
      return NextResponse.json({ error: 'Auction not found' }, { status: 404 });
    }

    // Get participant requests for selected participants
    const participantRequests = await prisma.participantRequest.findMany({
      where: {
        participantId: {
          in: participantIds
        },
        isActive: true,
        participant: {
          isActive: true
        }
      },
      distinct: ['participantId']
    });

    // Verify we found participant requests for all participants
    if (participantRequests.length !== participantIds.length) {
      console.error('Participant request count mismatch:', {
        expectedCount: participantIds.length,
        foundCount: participantRequests.length,
        participantIds,
        foundRequestIds: participantRequests.map(pr => pr.id)
      });
      return NextResponse.json({ error: 'One or more participants do not have active requests' }, { status: 400 });
    }

    // Create participant assignments in a transaction
    const assignments = await prisma.$transaction(async (tx) => {
      // First, delete any existing assignments for this auction
      await tx.auctionParticipants.deleteMany({
        where: { auctionId: parseInt(id) }
      });

      // Then create new assignments
      return Promise.all(
        participantRequests.map(pr => 
          tx.auctionParticipants.create({
            data: {
              auctionId: parseInt(id),
              participantId: pr.participantId,
              status: 'PENDING'
            }
          })
        )
      );
    });

    return NextResponse.json(assignments, { status: 200 });

  } catch (error) {
    console.error('Error assigning participants:', error);
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid request data', 
        details: error.errors 
      }, { status: 400 });
    }

    // Handle Prisma errors
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });

      // Check for specific Prisma errors
      if (error.name === 'PrismaClientKnownRequestError') {
        return NextResponse.json({ 
          error: 'Database operation failed', 
          details: error.message 
        }, { status: 500 });
      }
    }

    return NextResponse.json({ 
      error: 'Failed to assign participants',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get auction ID from params
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Auction ID is required' }, { status: 400 });
    }

    // Get auction participants
    const participants = await prisma.auctionParticipants.findMany({
      where: {
        auctionId: parseInt(id)
      },
      include: {
        participant: {
          include: {
            participant: true
          }
        }
      }
    });

    return NextResponse.json(participants, { status: 200 });

  } catch (error) {
    console.error('Error fetching auction participants:', error);
    return NextResponse.json({ error: 'Failed to fetch participants' }, { status: 500 });
  }
}
