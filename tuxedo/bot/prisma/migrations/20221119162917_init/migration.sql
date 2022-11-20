-- CreateEnum
CREATE TYPE "PremiumType" AS ENUM ('Gold', 'Silver');

-- CreateTable
CREATE TABLE "Server" (
    "id" SERIAL NOT NULL,
    "serverId" VARCHAR(255) NOT NULL,
    "botJoinedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "premium" "PremiumType",
    "locale" TEXT NOT NULL DEFAULT 'en-US',
    "prefix" TEXT,

    CONSTRAINT "Server_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Server_serverId_key" ON "Server"("serverId");
