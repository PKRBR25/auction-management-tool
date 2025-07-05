-- AlterTable
ALTER TABLE "auction_request" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending';

-- CreateTable
CREATE TABLE "auction_participants" (
    "auction_participant_id" SERIAL NOT NULL,
    "auction_id" INTEGER NOT NULL,
    "participant_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auction_participants_pkey" PRIMARY KEY ("auction_participant_id")
);

-- AddForeignKey
ALTER TABLE "auction_participants" ADD CONSTRAINT "auction_participants_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "auction_request"("auction_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auction_participants" ADD CONSTRAINT "auction_participants_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "participants_request"("participant_id") ON DELETE RESTRICT ON UPDATE CASCADE;
