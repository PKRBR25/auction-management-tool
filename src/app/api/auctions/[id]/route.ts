import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

const AuctionInclude = {
  auctionData: true,
  user: {
    select: {
      email: true,
      fullName: true
    }
  },
  participants: {
    include: {
      participant: {
        include: {
          participant: {
            select: {
              id: true,
              name: true,
              email: true,
              contactName: true,
              phone: true,
              isActive: true
            }
          }
        }
      }
    }
  }
} as const;

type AuctionParticipantData = {
  participant: {
    participant: {
      id: number;
      name: string;
      email: string;
      contactName: string;
      phone: bigint;
      isActive: boolean;
    };
  };
};

interface AuctionData {
  description: string;
  freight: string;
  from: string;
  to: string;
  vehicle: string;
  type: string;
  tracking: string;
  insurance: string;
}

interface BaseAuction {
  id: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
}

interface AuctionWithRelations extends BaseAuction {
  auctionData: AuctionData;
  participants: AuctionParticipantData[];
  user: {
    email: string;
    fullName: string;
  };
}

type TransformedParticipant = {
  id: number;
  name: string;
  email: string;
  contactName: string;
  phone: string;
};

type TransformedAuction = {
  id: number;
  description: string;
  freight: string;
  from: string;
  to: string;
  vehicle: string;
  type: string;
  tracking: string;
  insurance: string;
  participants: TransformedParticipant[];
};

type AuctionParticipant = {
  participant: {
    id: number;
    name: string;
    email: string;
  };
};





const auctionSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  freight: z.string().min(1, 'Freight is required'),
  from: z.string().min(1, 'From location is required'),
  to: z.string().min(1, 'To location is required'),
  vehicle: z.enum(['URBAN_CARGO', 'RURAL_CARGO', 'TRUCK', 'HEAVY_TRUCK']),
  type: z.enum(['FLEET', 'THIRD_PART']),
  tracking: z.enum(['REAL_TIME', 'NO']),
  insurance: z.enum(['YES', 'NO'])
});

// GET /api/auctions/[id] - Get specific auction
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auctionId = parseInt(params.id);

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate auction ID
    if (isNaN(auctionId)) {
      return NextResponse.json({ error: 'Invalid auction ID' }, { status: 400 });
    }

    // Get auction with related data
    const auction = await prisma.auctionRequest.findFirst({
      where: {
        id: auctionId,
        user: {
          email: session.user.email
        },
        isActive: true
      },
      include: AuctionInclude
    }) as AuctionWithRelations | null;

    console.log('GET /api/auctions/[id] - Found auction:', {
      id: auction?.id,
      hasAuctionData: !!auction?.auctionData,
      participantCount: auction?.participants?.length
    });

    if (!auction) {
      console.error('GET /api/auctions/[id] - Auction not found:', { auctionId });
      return NextResponse.json({ 
        error: 'Auction not found',
        details: 'The requested auction does not exist or you do not have access to it'
      }, { status: 404 });
    }

    if (!auction.auctionData) {
      console.error('GET /api/auctions/[id] - Missing auction data:', { auctionId });
      return NextResponse.json({ 
        error: 'Invalid auction data',
        details: 'The auction exists but has no associated data'
      }, { status: 500 });
    }

    // Transform the data to match the expected format
    const transformedAuction: TransformedAuction = {
      id: auction.id,
      description: auction.auctionData.description,
      freight: auction.auctionData.freight,
      from: auction.auctionData.from,
      to: auction.auctionData.to,
      vehicle: auction.auctionData.vehicle,
      type: auction.auctionData.type,
      tracking: auction.auctionData.tracking,
      insurance: auction.auctionData.insurance,
      participants: auction.participants
        .map((ap: AuctionParticipantData) => {
          if (!ap.participant?.participant) {
            console.error('Missing participant data for auction participant:', ap);
            return null;
          }
          return {
            id: ap.participant.participant.id,
            name: ap.participant.participant.name,
            email: ap.participant.participant.email,
            contactName: ap.participant.participant.contactName,
            phone: ap.participant.participant.phone.toString()
          };
        })
        .filter((p: TransformedParticipant | null): p is TransformedParticipant => p !== null)
    };

    console.log('GET /api/auctions/[id] - Returning transformed auction:', {
      id: transformedAuction.id,
      participantCount: transformedAuction.participants.length
    });
    
    return NextResponse.json(transformedAuction);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error('GET /api/auctions/[id] - Error:', {
      error: errorMessage,
      stack: errorStack,
      auctionId
    });

    if (error instanceof Error) {
      return NextResponse.json(
        { 
          error: 'Failed to fetch auction',
          details: error.message
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to fetch auction',
        details: 'An unexpected error occurred'
      },
      { status: 500 }
    );
  }
}

// PUT /api/auctions/[id] - Update auction
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const json = await request.json();
    const validatedData = auctionSchema.parse(json);

    const { id } = await params;
    const auction = await prisma.auctionRequest.findUnique({
      where: { id: parseInt(id) },
      include: { auctionData: true }
    });

    if (!auction) {
      return NextResponse.json({ error: 'Auction not found' }, { status: 404 });
    }

    const updatedAuction = await prisma.auctionRequest.update({
      where: { id: parseInt(id) },
      data: {
        auctionData: {
          update: {
            ...validatedData
          }
        }
      },
      include: {
        auctionData: true
      }
    });

    return NextResponse.json(updatedAuction);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid auction data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating auction:', error);
    return NextResponse.json(
      { error: 'Failed to update auction' },
      { status: 500 }
    );
  }
}

// DELETE /api/auctions/[id] - Soft delete auction
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const auction = await prisma.auctionRequest.findUnique({
      where: { id: parseInt(id) }
    });

    if (!auction) {
      return NextResponse.json({ error: 'Auction not found' }, { status: 404 });
    }

    const updatedAuction = await prisma.auctionRequest.update({
      where: { id: parseInt(id) },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(updatedAuction);
  } catch (error) {
    console.error('Error deleting auction:', error);
    return NextResponse.json(
      { error: 'Failed to delete auction' },
      { status: 500 }
    );
  }
}
