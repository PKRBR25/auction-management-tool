import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { GET, POST } from '@/app/api/auctions/route';
import { GET as GET_BY_ID, PUT, DELETE } from '@/app/api/auctions/[id]/route';

// Mock next-auth
vi.mock('next-auth', () => ({
  getServerSession: vi.fn()
}));

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  default: {
    auctionRequest: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn()
    },
    user: {
      findUnique: vi.fn()
    }
  }
}));

describe('Auctions API', () => {
  const mockSession = {
    user: { email: 'test@example.com' }
  };

  const mockUser = {
    id: 1,
    email: 'test@example.com'
  };

  const mockAuction = {
    id: 1,
    userId: 1,
    isActive: true,
    auctionData: {
      description: 'Test Auction',
      freight: 'Test Freight',
      from: 'Origin',
      to: 'Destination',
      vehicle: 'URBAN_CARGO',
      type: 'FLEET',
      tracking: 'REAL_TIME',
      insurance: 'YES'
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (getServerSession as any).mockResolvedValue(mockSession);
  });

  describe('GET /api/auctions', () => {
    it('should return all auctions for authenticated user', async () => {
      (prisma.auctionRequest.findMany as any).mockResolvedValue([mockAuction]);

      const response = await GET();
      const data = await response.json();

      expect(response).toBeInstanceOf(NextResponse);
      expect(data).toEqual([mockAuction]);
    });

    it('should return 401 if user is not authenticated', async () => {
      (getServerSession as any).mockResolvedValue(null);

      const response = await GET();
      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/auctions', () => {
    it('should create a new auction', async () => {
      (prisma.user.findUnique as any).mockResolvedValue(mockUser);
      (prisma.auctionRequest.create as any).mockResolvedValue(mockAuction);

      const request = new Request('http://localhost/api/auctions', {
        method: 'POST',
        body: JSON.stringify(mockAuction.auctionData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(mockAuction);
    });

    it('should validate auction data', async () => {
      const request = new Request('http://localhost/api/auctions', {
        method: 'POST',
        body: JSON.stringify({})
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/auctions/[id]', () => {
    it('should return specific auction', async () => {
      (prisma.auctionRequest.findUnique as any).mockResolvedValue(mockAuction);

      const response = await GET_BY_ID(
        new Request('http://localhost/api/auctions/1'),
        { params: { id: '1' } }
      );
      const data = await response.json();

      expect(data).toEqual(mockAuction);
    });

    it('should return 404 for non-existent auction', async () => {
      (prisma.auctionRequest.findUnique as any).mockResolvedValue(null);

      const response = await GET_BY_ID(
        new Request('http://localhost/api/auctions/999'),
        { params: { id: '999' } }
      );
      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/auctions/[id]', () => {
    it('should update auction', async () => {
      (prisma.auctionRequest.findUnique as any).mockResolvedValue(mockAuction);
      (prisma.auctionRequest.update as any).mockResolvedValue({
        ...mockAuction,
        auctionData: {
          ...mockAuction.auctionData,
          description: 'Updated Auction'
        }
      });

      const request = new Request('http://localhost/api/auctions/1', {
        method: 'PUT',
        body: JSON.stringify({
          ...mockAuction.auctionData,
          description: 'Updated Auction'
        })
      });

      const response = await PUT(request, { params: { id: '1' } });
      const data = await response.json();

      expect(data.auctionData.description).toBe('Updated Auction');
    });
  });

  describe('DELETE /api/auctions/[id]', () => {
    it('should soft delete auction', async () => {
      (prisma.auctionRequest.findUnique as any).mockResolvedValue(mockAuction);
      (prisma.auctionRequest.update as any).mockResolvedValue({
        ...mockAuction,
        isActive: false
      });

      const response = await DELETE(
        new Request('http://localhost/api/auctions/1'),
        { params: { id: '1' } }
      );
      const data = await response.json();

      expect(data.isActive).toBe(false);
    });
  });
});
