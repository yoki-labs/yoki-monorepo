-- CreateEnum
CREATE TYPE "LogChannelType" AS ENUM ('ALL', 'FALLBACK', 'MOD_ACTION_LOG', 'MEMBER_ROLES_UPDATE', 'MEMBER_UPDATE', 'MEMBER_JOIN_LEAVE', 'CHAT_MESSAGE_UPDATE', 'CHAT_MESSAGE_DELETE', 'NOTIFICATION');

-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('MOD', 'REACT');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('WARN', 'MUTE', 'KICK', 'SOFTBAN', 'BAN');

-- CreateTable
CREATE TABLE "Server" (
    "id" SERIAL NOT NULL,
    "serverId" VARCHAR(255) NOT NULL,
    "botJoinedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "premium" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT NOT NULL DEFAULT E'en-US',
    "muteRoleId" TEXT,
    "filterEnabled" BOOLEAN NOT NULL DEFAULT false,
    "disabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Server_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogChannel" (
    "id" SERIAL NOT NULL,
    "serverId" VARCHAR(255) NOT NULL,
    "type" "LogChannelType" NOT NULL,

    CONSTRAINT "LogChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "serverId" VARCHAR(255) NOT NULL,
    "roleId" VARCHAR(255) NOT NULL,
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

    CONSTRAINT "ContentFilter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomTag" (
    "id" SERIAL NOT NULL,
    "serverId" VARCHAR(255) NOT NULL,
    "content" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,

    CONSTRAINT "CustomTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Action" (
    "id" SERIAL NOT NULL,
    "serverId" VARCHAR(255) NOT NULL,
    "type" "Severity" NOT NULL,
    "logChannelId" VARCHAR(255) NOT NULL,
    "logChannelMessage" VARCHAR(255) NOT NULL,
    "executorId" VARCHAR(255) NOT NULL,
    "reason" VARCHAR(255),
    "targetId" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "Action_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "serverId" VARCHAR(255) NOT NULL,
    "channelId" VARCHAR(255) NOT NULL,
    "authorId" VARCHAR(255) NOT NULL,
    "content" VARCHAR(255) NOT NULL,
    "embeds" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Server_serverId_key" ON "Server"("serverId");
