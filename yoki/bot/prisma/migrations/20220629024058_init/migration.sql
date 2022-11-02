-- CreateEnum
CREATE TYPE "ReactionActionType" AS ENUM ('MODMAIL');

-- AlterTable
ALTER TABLE "Server" ADD COLUMN     "modmailGroupId" VARCHAR(255);

-- CreateTable
CREATE TABLE "ReactionAction" (
    "id" SERIAL NOT NULL,
    "channelId" VARCHAR(255) NOT NULL,
    "serverId" VARCHAR(255) NOT NULL,
    "messageId" VARCHAR(255) NOT NULL,
    "emoteId" INTEGER NOT NULL,
    "actionType" "ReactionActionType" NOT NULL,

    CONSTRAINT "ReactionAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModmailThread" (
    "id" SERIAL NOT NULL,
    "serverId" VARCHAR(255) NOT NULL,
    "userFacingChannelId" VARCHAR(255) NOT NULL,
    "modFacingChannelId" VARCHAR(255) NOT NULL,
    "openerId" VARCHAR(255) NOT NULL,
    "handlingModerators" TEXT[],
    "closed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ModmailThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModmailMessage" (
    "originalMessageId" VARCHAR(255) NOT NULL,
    "sentMessageId" VARCHAR(255) NOT NULL,
    "channelId" VARCHAR(255) NOT NULL,
    "authorId" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "modmailThreadId" INTEGER NOT NULL,

    CONSTRAINT "ModmailMessage_pkey" PRIMARY KEY ("originalMessageId")
);

-- AddForeignKey
ALTER TABLE "ModmailMessage" ADD CONSTRAINT "ModmailMessage_modmailThreadId_fkey" FOREIGN KEY ("modmailThreadId") REFERENCES "ModmailThread"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
