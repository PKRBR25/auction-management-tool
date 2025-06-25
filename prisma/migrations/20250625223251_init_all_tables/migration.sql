-- CreateEnum
CREATE TYPE "Vehicle" AS ENUM ('URBAN_CARGO', 'RURAL_CARGO', 'TRUCK', 'HEAVY_TRUCK');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('FLEET', 'THIRD_PART');

-- CreateEnum
CREATE TYPE "TrackingType" AS ENUM ('REAL_TIME', 'NO');

-- CreateEnum
CREATE TYPE "InsuranceType" AS ENUM ('YES', 'NO');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "hashedPassword" TEXT NOT NULL,
    "fullName" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "active_since" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verification_token" INTEGER,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "verified_since" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset" (
    "pr_id" SERIAL NOT NULL,
    "users_id" INTEGER NOT NULL,
    "pr_token" INTEGER NOT NULL,
    "pr_token_expires_at" TIMESTAMP(3) NOT NULL,
    "pr_token_locked_until" TIMESTAMP(3),
    "pr_token_valid_until" TIMESTAMP(3),

    CONSTRAINT "password_reset_pkey" PRIMARY KEY ("pr_id")
);

-- CreateTable
CREATE TABLE "auction_request" (
    "auction_id" SERIAL NOT NULL,
    "users_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "active_since" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auction_request_pkey" PRIMARY KEY ("auction_id")
);

-- CreateTable
CREATE TABLE "auction_data" (
    "auction_id" SERIAL NOT NULL,
    "auctionRequestId" INTEGER NOT NULL,
    "auction_description" TEXT NOT NULL,
    "freight" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "vehicle" "Vehicle" NOT NULL,
    "type" "VehicleType" NOT NULL,
    "tracking" "TrackingType" NOT NULL,
    "insurance" "InsuranceType" NOT NULL,

    CONSTRAINT "auction_data_pkey" PRIMARY KEY ("auction_id")
);

-- CreateTable
CREATE TABLE "participants" (
    "participant_id" SERIAL NOT NULL,
    "participant_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contact_name" TEXT NOT NULL,
    "phone" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "active_since" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "participants_pkey" PRIMARY KEY ("participant_id")
);

-- CreateTable
CREATE TABLE "participants_request" (
    "participant_id" SERIAL NOT NULL,
    "participantId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "active_since" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "participants_request_pkey" PRIMARY KEY ("participant_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_verification_token_key" ON "users"("verification_token");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_pr_token_key" ON "password_reset"("pr_token");

-- CreateIndex
CREATE UNIQUE INDEX "auction_data_auctionRequestId_key" ON "auction_data"("auctionRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "participants_email_key" ON "participants"("email");

-- AddForeignKey
ALTER TABLE "password_reset" ADD CONSTRAINT "password_reset_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auction_request" ADD CONSTRAINT "auction_request_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auction_data" ADD CONSTRAINT "auction_data_auctionRequestId_fkey" FOREIGN KEY ("auctionRequestId") REFERENCES "auction_request"("auction_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participants_request" ADD CONSTRAINT "participants_request_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "participants"("participant_id") ON DELETE RESTRICT ON UPDATE CASCADE;
