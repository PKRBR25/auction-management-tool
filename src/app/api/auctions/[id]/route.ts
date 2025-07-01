import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

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
    contactName: string;
    phone: bigint;
    isActive: boolean;
  };
};

type AuctionWithRelations = {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  activeSince: Date;
  userId: number;
  user: {
    email: string;
    fullName: string;
  };
  auctionData: {
    description: string;
    freight: string;
    from: string;
    to: string;
    vehicle: string;
    type: string;
    tracking: string;
    insurance: string;
  };
  participants: Array<{
    participant: {
      id: number;
      name: string;
      email: string;
      contactName: string;
      phone: bigint;
      isActive: boolean;
    };
  }>;
};

type AuctionQueryType = Prisma.AuctionRequestGetPayload<{
  include: {
    auctionData: true;
    user: {
      select: {
        email: true;
        fullName: true;
      };
    };
    participants: {
      include: {
        participant: {
          select: {
            id: true;
            name: true;
            email: true;
            contactName: true;
            phone: true;
            isActive: true;
          };
        };
      };
    };
  };
}>;

type AuctionQueryInclude = {
  auctionData: true;
  participants: {
    include: {
      participant: {
        select: {
          id: true;
          name: true;
          email: true;
          contactName: true;
          phone: true;
          isActive: true;
        };
      };
    };
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
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('GET /api/auctions/[id] - Params:', params);

    // Get and validate session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      console.log('GET /api/auctions/[id] - Unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate auction ID
    if (!params.id) {
      console.log('GET /api/auctions/[id] - Missing ID');
      return NextResponse.json({ error: 'Auction ID is required' }, { status: 400 });
    }

    const auctionId = parseInt(params.id);
    if (isNaN(auctionId)) {
      console.log('GET /api/auctions/[id] - Invalid ID format:', params.id);
      return NextResponse.json({ error: 'Invalid auction ID format' }, { status: 400 });
    }

    console.log('GET /api/auctions/[id] - Fetching auction:', params.id);

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      console.log('GET /api/auctions/[id] - User not found:', session.user.email);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('GET /api/auctions/[id] - Fetching auction:', auctionId);

    // Find the auction with user validation
    const auction = await prisma.auctionRequest.findFirst({
      where: {
        id: auctionId,
        userId: user.id // Only allow access to own auctions
      },
      include: {
        auctionData: true,
        user: {
          select: {
            email: true,
            fullName: true
          }
        },
        participants: {
          where: {
            status: 'pending' // Only include active assignments
          },
          include: {
            participant: {
              where: {
                isActive: true // Only include active participants
              },
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
      } as AuctionQueryInclude
    }) as unknown as AuctionWithRelations;

    console.log('Found auction:', {
      id: auction?.id,
      hasAuctionData: !!auction?.auctionData,
      participantCount: auction?.participants?.length
    });

    console.log('GET /api/auctions/[id] - Found auction:', {
      id: auction?.id,
      hasAuctionData: !!auction?.auctionData,
      participantCount: auction?.participants?.length
    });

    if (!auction) {
      return NextResponse.json({ error: 'Auction not found' }, { status: 404 });
    }

    if (!auction.auctionData) {
      return NextResponse.json({ error: 'Invalid auction data' }, { status: 500 });
    }

    // Ensure participants array exists
    const participants = auction.participants || [];

    // Transform the data to match the expected format
    const transformedAuction: TransformedAuction = {
      id: auction.id,
      ...auction.auctionData,
      participants: participants
        .filter(ap => ap.participant) // Filter out any invalid assignments
        .map(ap => {
          const participant = ap.participant;
          if (!participant) {
            console.error('Missing participant data for auction participant:', ap);
            return null;
          }
          return {
            id: participant.id,
            name: participant.name,
            email: participant.email,
            contactName: participant.contactName,
            phone: participant.phone.toString()
          };
        })
        .filter((p): p is TransformedParticipant => p !== null)
    };

    console.log('Transformed auction:', {
      id: transformedAuction.id,
      participantCount: transformedAuction.participants.length
    });

    console.log('GET /api/auctions/[id] - Returning transformed auction:', {
      id: transformedAuction.id,
      participantCount: transformedAuction.participants.length
    });
    
    return NextResponse.json(transformedAuction);
  } catch (error) {
    console.error('Error fetching auction:', error);
    return NextResponse.json(
      { error: 'Failed to fetch auction' },
      { status: 500 }
    );
  }
}

// PUT /api/auctions/[id] - Update auction
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const json = await request.json();
    const validatedData = auctionSchema.parse(json);

    const auction = await prisma.auctionRequest.findUnique({
      where: { id: parseInt(params.id) },
      include: { auctionData: true }
    });

    if (!auction) {
      return NextResponse.json({ error: 'Auction not found' }, { status: 404 });
    }

    const updatedAuction = await prisma.auctionRequest.update({
      where: { id: parseInt(params.id) },
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
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const auction = await prisma.auctionRequest.findUnique({
      where: { id: parseInt(params.id) }
    });

    if (!auction) {
      return NextResponse.json({ error: 'Auction not found' }, { status: 404 });
    }

    const updatedAuction = await prisma.auctionRequest.update({
      where: { id: parseInt(params.id) },
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
