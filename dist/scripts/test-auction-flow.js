"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
// Update Prisma to use the correct database URL
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/auction_management';
const crypto_1 = require("crypto");
const prisma = new client_1.PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});
async function createTestUser() {
    const email = `test_${(0, crypto_1.randomUUID)()}@example.com`;
    return await prisma.user.create({
        data: {
            email,
            fullName: 'Test User',
            password: 'test123', // In real app this would be hashed
            isActive: true,
            emailVerified: new Date(),
        },
    });
}
async function createTestParticipants(count) {
    const participants = [];
    for (let i = 0; i < count; i++) {
        const participant = await prisma.participant.create({
            data: {
                name: `Test Participant ${i + 1}`,
                email: `participant_${i + 1}_${(0, crypto_1.randomUUID)()}@example.com`,
                contactName: `Contact ${i + 1}`,
                phone: BigInt('1234567890'),
                isActive: true,
            },
        });
        // Create participant request for each participant
        await prisma.participantRequest.create({
            data: {
                participantId: participant.id,
                isActive: true,
            },
        });
        participants.push(participant);
    }
    return participants;
}
async function createTestAuction(userId) {
    console.log('\n🚀 Creating test auction...');
    // First create auction request
    const auctionRequest = await prisma.auctionRequest.create({
        data: {
            userId,
            isActive: true,
            activeSince: new Date(),
            auctionData: {
                create: {
                    description: 'Test Auction',
                    freight: 'Test Freight',
                    from: 'Origin',
                    to: 'Destination',
                    vehicle: 'Truck',
                    type: 'Fleet',
                    tracking: 'Real Time',
                    insurance: 'Yes',
                },
            },
        },
        include: {
            auctionData: true,
        },
    });
    console.log('✅ Auction created:', {
        id: auctionRequest.id,
        hasAuctionData: !!auctionRequest.auctionData,
    });
    return auctionRequest;
}
async function assignParticipantsToAuction(auctionId, participantIds) {
    console.log('\n🔄 Assigning participants to auction...');
    try {
        // Get participant requests
        const participantRequests = await prisma.participantRequest.findMany({
            where: {
                participantId: {
                    in: participantIds,
                },
                isActive: true,
                participant: {
                    isActive: true,
                },
            },
            distinct: ['participantId'],
        });
        console.log('Found participant requests:', participantRequests.length);
        // Create assignments in transaction
        const assignments = await prisma.$transaction(async (tx) => {
            // Delete existing assignments
            await tx.auctionParticipant.deleteMany({
                where: { auctionId },
            });
            // Create new assignments
            return Promise.all(participantRequests.map((pr) => tx.auctionParticipant.create({
                data: {
                    auctionId,
                    participantId: pr.participantId,
                    status: 'PENDING',
                },
            })));
        });
        console.log('✅ Participants assigned:', assignments.length);
        return assignments;
    }
    catch (error) {
        console.error('❌ Error assigning participants:', error);
        throw error;
    }
}
async function verifyAssignments(auctionId) {
    var _a;
    console.log('\n🔍 Verifying assignments...');
    const auction = await prisma.auctionRequest.findUnique({
        where: { id: auctionId },
        include: {
            auctionData: true,
            participants: {
                include: {
                    participant: true,
                },
            },
        },
    });
    console.log('Auction details:', {
        id: auction === null || auction === void 0 ? void 0 : auction.id,
        hasAuctionData: !!(auction === null || auction === void 0 ? void 0 : auction.auctionData),
        participantCount: (_a = auction === null || auction === void 0 ? void 0 : auction.participants) === null || _a === void 0 ? void 0 : _a.length,
    });
    if (auction === null || auction === void 0 ? void 0 : auction.participants) {
        console.log('\nAssigned participants:');
        auction.participants.forEach((ap) => {
            var _a;
            console.log({
                participantId: ap.participantId,
                participantName: (_a = ap.participant) === null || _a === void 0 ? void 0 : _a.name,
                status: ap.status,
            });
        });
    }
}
async function main() {
    try {
        console.log('🏁 Starting auction flow test...');
        // Create test user
        const user = await createTestUser();
        console.log('\n✅ Test user created:', { id: user.id, email: user.email });
        // Create test participants
        const participants = await createTestParticipants(3);
        console.log('\n✅ Test participants created:', participants.length);
        // Create test auction
        const auction = await createTestAuction(user.id);
        // Assign participants
        await assignParticipantsToAuction(auction.id, participants.map((p) => p.id));
        // Verify assignments
        await verifyAssignments(auction.id);
        console.log('\n🎉 Test completed successfully!');
    }
    catch (error) {
        console.error('\n❌ Test failed:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
