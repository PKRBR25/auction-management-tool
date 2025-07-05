import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Schema for auction data validation
const auctionSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  freight: z.string().min(1, 'Freight is required'),
  from: z.string().min(1, 'From location is required'),
  to: z.string().min(1, 'To location is required'),
  vehicle: z.enum(['URBAN_CARGO', 'RURAL_CARGO', 'TRUCK', 'HEAVY_TRUCK'], {
    required_error: 'Vehicle is required',
    invalid_type_error: 'Invalid vehicle type'
  }),
  type: z.enum(['FLEET', 'THIRD_PART'], {
    required_error: 'Type is required',
    invalid_type_error: 'Invalid type'
  }),
  tracking: z.enum(['REAL_TIME', 'NO'], {
    required_error: 'Tracking is required',
    invalid_type_error: 'Invalid tracking option'
  }),
  insurance: z.enum(['YES', 'NO'], {
    required_error: 'Insurance is required',
    invalid_type_error: 'Invalid insurance option'
  })
});

// GET /api/auctions - List all auctions
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the current user
    const user = await prisma.user.findUnique({
      where: { email: session.user?.email! }
    });

    if (!user) {
      console.error('User not found:', session.user?.email);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find all active auctions for the current user
    const auctions = await prisma.auctionRequest.findMany({
      where: {
        userId: user.id,
        isActive: true
      },
      include: {
        auctionData: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform the data to match the frontend interface
    const transformedAuctions = auctions.map(auction => ({
      id: auction.id, // Changed from auction_id to id to match other endpoints
      from: auction.auctionData?.from || '',
      to: auction.auctionData?.to || '',
      isActive: auction.isActive, // Changed from is_active to isActive
      description: auction.auctionData?.description || '',
      freight: auction.auctionData?.freight || '',
      createdAt: auction.createdAt // Changed from created_at to createdAt
    }));

    console.log('Returning auctions:', {
      count: transformedAuctions.length,
      userEmail: session.user?.email
    });

    return NextResponse.json(transformedAuctions);
  } catch (error) {
    console.error('Error fetching auctions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch auctions' },
      { status: 500 }
    );
  }
}

// POST /api/auctions - Create new auction
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const json = await request.json();
    console.log('Received auction data:', json);

    try {
      const validatedData = auctionSchema.parse({
        ...json,
        vehicle: json.vehicle.toUpperCase(),
        type: json.type.toUpperCase(),
        tracking: json.tracking.toUpperCase(),
        insurance: json.insurance.toUpperCase()
      });
      console.log('Validated auction data:', validatedData);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        console.error('Validation error:', validationError.errors);
        return NextResponse.json(
          { error: 'Invalid auction data', details: validationError.errors },
          { status: 400 }
        );
      }
      throw validationError;
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user?.email! }
    });

    if (!user) {
      console.error('User not found:', session.user?.email);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('Found user:', user.id);

    try {
      const auction = await prisma.auctionRequest.create({
        data: {
          userId: user.id,
          isActive: true,
          auctionData: {
            create: json
          }
        },
        include: {
          auctionData: true
        }
      });

      console.log('Created auction:', {
        id: auction.id,
        hasAuctionData: !!auction.auctionData
      });
      return NextResponse.json({
        id: auction.id,
        isActive: auction.isActive,
        createdAt: auction.createdAt,
        ...auction.auctionData
      }, { status: 201 });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Database error', details: (dbError as Error).message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}
