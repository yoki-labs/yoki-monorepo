-- AlterEnum
ALTER TYPE "PremiumType" ADD VALUE 'Copper';

-- CreateTable
CREATE TABLE "Giveaway" (
    "id" VARCHAR(255) NOT NULL,
    "serverId" VARCHAR(255) NOT NULL,
    "channelId" VARCHAR(255) NOT NULL,
    "text" VARCHAR(200) NOT NULL,
    "participants" TEXT[],
    "winnerCount" INTEGER NOT NULL,
    "winners" TEXT[],
    "endsAt" TIMESTAMP(3) NOT NULL,
    "createdBy" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Giveaway_pkey" PRIMARY KEY ("id")
);
