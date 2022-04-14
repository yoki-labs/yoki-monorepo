-- CreateEnum
CREATE TYPE "LogChannelType" AS ENUM ('ALL', 'FALLBACK', 'MOD_ACTION_LOG', 'FILTER', 'MEMBER_ROLES_UPDATE', 'MEMBER_UPDATE', 'MEMBER_JOIN_LEAVE', 'CHAT_MESSAGE_UPDATE', 'CHAT_MESSAGE_DELETE', 'NOTIFICATION');

-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('MOD', 'ADMIN', 'REACT');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('WARN', 'MUTE', 'KICK', 'SOFTBAN', 'BAN');

-- CreateTable
CREATE TABLE "Server" (
    "id" SERIAL NOT NULL,
    "serverId" VARCHAR(255) NOT NULL,
    "botJoinedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "premium" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT NOT NULL DEFAULT E'en-US',
    "muteRoleId" INTEGER,
    "filterEnabled" BOOLEAN NOT NULL DEFAULT false,
    "blacklisted" BOOLEAN NOT NULL DEFAULT false,
    "flags" TEXT[],
    "muteInfractionThreshold" INTEGER DEFAULT 10,
    "kickInfractionThreshold" INTEGER DEFAULT 15,
    "banInfractionThreshold" INTEGER DEFAULT 45,
    "softbanInfractionThreshold" INTEGER DEFAULT 25,
    "spamInfractionPoints" INTEGER NOT NULL DEFAULT 5,
    "filterOnMods" BOOLEAN NOT NULL DEFAULT false,
    "prefix" TEXT,

    CONSTRAINT "Server_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogChannel" (
    "id" SERIAL NOT NULL,
    "serverId" VARCHAR(255) NOT NULL,
    "channelId" VARCHAR(255) NOT NULL,
    "type" "LogChannelType" NOT NULL,

    CONSTRAINT "LogChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "serverId" VARCHAR(255) NOT NULL,
    "roleId" INTEGER NOT NULL,
    "type" "RoleType" NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentFilter" (
    "id" SERIAL NOT NULL,
    "serverId" VARCHAR(255) NOT NULL,
    "content" VARCHAR(255) NOT NULL,
    "severity" "Severity" NOT NULL,
    "creatorId" VARCHAR(255) NOT NULL,
    "infractionPoints" INTEGER NOT NULL,

    CONSTRAINT "ContentFilter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Preset" (
    "id" SERIAL NOT NULL,
    "serverId" TEXT NOT NULL,
    "preset" VARCHAR(255) NOT NULL,

    CONSTRAINT "Preset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomTag" (
    "id" SERIAL NOT NULL,
    "serverId" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,

    CONSTRAINT "CustomTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Action" (
    "id" SERIAL NOT NULL,
    "referenceId" VARCHAR(255) NOT NULL,
    "serverId" VARCHAR(255) NOT NULL,
    "type" "Severity" NOT NULL,
    "logChannelId" VARCHAR(255),
    "logChannelMessage" VARCHAR(255),
    "executorId" VARCHAR(255) NOT NULL,
    "reason" TEXT,
    "triggerWord" TEXT,
    "infractionPoints" INTEGER NOT NULL,
    "targetId" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "expired" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Action_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "messageId" VARCHAR(255) NOT NULL,
    "serverId" VARCHAR(255) NOT NULL,
    "channelId" VARCHAR(255) NOT NULL,
    "authorId" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "embeds" JSONB NOT NULL,
    "isBot" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Server_serverId_key" ON "Server"("serverId");
