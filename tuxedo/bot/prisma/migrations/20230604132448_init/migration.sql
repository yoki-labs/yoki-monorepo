-- CreateEnum
CREATE TYPE "PremiumType" AS ENUM ('Gold', 'Silver', 'Copper');

-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('MINIMOD', 'MOD', 'ADMIN');

-- CreateTable
CREATE TABLE "Server" (
    "id" SERIAL NOT NULL,
    "serverId" VARCHAR(255) NOT NULL,
    "premium" "PremiumType",
    "blacklisted" BOOLEAN NOT NULL DEFAULT false,
    "flags" TEXT[],
    "prefix" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'en-US',
    "timezone" TEXT,
    "botJoinedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Server_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Giveaway" (
    "id" VARCHAR(255) NOT NULL,
    "serverId" VARCHAR(255) NOT NULL,
    "channelId" VARCHAR(255) NOT NULL,
    "messageId" VARCHAR(255) NOT NULL,
    "text" VARCHAR(200) NOT NULL,
    "participants" TEXT[],
    "winners" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "winnerCount" INTEGER NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "hasEnded" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Giveaway_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Currency" (
    "id" VARCHAR(255) NOT NULL,
    "serverId" VARCHAR(255) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "tag" VARCHAR(16) NOT NULL,
    "startingBalance" INTEGER,
    "maximumBalance" INTEGER,
    "createdBy" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Currency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServerMember" (
    "id" VARCHAR(255) NOT NULL,
    "serverId" VARCHAR(255) NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    "balance" JSONB,
    "bankBalance" JSONB,

    CONSTRAINT "ServerMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "serverId" VARCHAR(255) NOT NULL,
    "roleId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "RoleType" NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Server_serverId_key" ON "Server"("serverId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_serverId_roleId_type_key" ON "Role"("serverId", "roleId", "type");
