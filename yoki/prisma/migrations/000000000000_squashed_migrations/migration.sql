-- CreateEnum
CREATE TYPE "ChannelIgnoreType" AS ENUM ('AUTOMOD', 'URL', 'INVITE');

-- CreateEnum
CREATE TYPE "ContentIgnoreType" AS ENUM ('MESSAGE', 'FORUM_TOPIC', 'FORUM_REPLY', 'LIST_ITEM');

-- CreateEnum
CREATE TYPE "LogChannelType" AS ENUM ('all', 'mod_actions', 'member_roles_updates', 'member_updates', 'member_joins', 'member_leaves', 'message_edits', 'message_deletions', 'topic_locks', 'topic_edits', 'topic_deletions', 'notifications', 'modmail_logs');

-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('MINIMOD', 'MOD', 'ADMIN', 'REACT');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('NOTE', 'WARN', 'MUTE', 'KICK', 'SOFTBAN', 'BAN');

-- CreateEnum
CREATE TYPE "FilterMatching" AS ENUM ('WORD', 'PREFIX', 'INFIX', 'POSTFIX');

-- CreateEnum
CREATE TYPE "ReactionActionType" AS ENUM ('MODMAIL');

-- CreateEnum
CREATE TYPE "PremiumType" AS ENUM ('Gold', 'Silver');

-- CreateEnum
CREATE TYPE "ResponseType" AS ENUM ('TEXT_CAPTCHA', 'SITE_CAPTCHA', 'KICK');

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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "muteRoleId" INTEGER,
    "linkSeverity" "Severity" NOT NULL DEFAULT 'WARN',
    "linkInfractionPoints" INTEGER NOT NULL DEFAULT 5,
    "spamInfractionPoints" INTEGER NOT NULL DEFAULT 5,
    "muteInfractionThreshold" INTEGER DEFAULT 10,
    "kickInfractionThreshold" INTEGER DEFAULT 15,
    "banInfractionThreshold" INTEGER DEFAULT 45,
    "softbanInfractionThreshold" INTEGER DEFAULT 25,
    "antiRaidEnabled" BOOLEAN NOT NULL DEFAULT false,
    "antiRaidResponse" "ResponseType",
    "antiRaidAgeFilter" INTEGER,
    "antiRaidChallengeChannel" VARCHAR(255),
    "memberRoleId" INTEGER,
    "appealChannelId" VARCHAR(255),
    "appealsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "modmailEnabled" BOOLEAN NOT NULL DEFAULT false,
    "modmailGroupId" VARCHAR(255),
    "modmailCategoryId" INTEGER,
    "filterEnabled" BOOLEAN NOT NULL DEFAULT false,
    "filterOnMods" BOOLEAN NOT NULL DEFAULT false,
    "filterInvites" BOOLEAN NOT NULL DEFAULT false,
    "antiHoistEnabled" BOOLEAN NOT NULL DEFAULT false,
    "urlFilterIsWhitelist" BOOLEAN NOT NULL DEFAULT false,
    "scanNSFW" BOOLEAN NOT NULL DEFAULT false,
    "spamFrequency" INTEGER NOT NULL DEFAULT 9,
    "spamMentionFrequency" INTEGER NOT NULL DEFAULT 5,

    CONSTRAINT "Server_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogChannel" (
    "id" SERIAL NOT NULL,
    "serverId" VARCHAR(255) NOT NULL,
    "channelId" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "LogChannelType" NOT NULL,
    "webhookId" VARCHAR(255),
    "webhookToken" VARCHAR(255),

    CONSTRAINT "LogChannel_pkey" PRIMARY KEY ("id")
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

-- CreateTable
CREATE TABLE "ContentFilter" (
    "id" SERIAL NOT NULL,
    "serverId" VARCHAR(255) NOT NULL,
    "content" VARCHAR(255) NOT NULL,
    "severity" "Severity" NOT NULL,
    "matching" "FilterMatching" NOT NULL DEFAULT 'WORD',
    "creatorId" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "infractionPoints" INTEGER NOT NULL,

    CONSTRAINT "ContentFilter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UrlFilter" (
    "id" SERIAL NOT NULL,
    "serverId" VARCHAR(255) NOT NULL,
    "domain" VARCHAR(255) NOT NULL,
    "subdomain" VARCHAR(100),
    "route" VARCHAR(200),
    "severity" "Severity" NOT NULL,
    "creatorId" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "infractionPoints" INTEGER NOT NULL,

    CONSTRAINT "UrlFilter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InviteFilter" (
    "id" SERIAL NOT NULL,
    "serverId" VARCHAR(255) NOT NULL,
    "targetServerId" VARCHAR(255) NOT NULL,
    "creatorId" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InviteFilter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Preset" (
    "id" SERIAL NOT NULL,
    "serverId" TEXT NOT NULL,
    "preset" VARCHAR(255) NOT NULL,
    "severity" "Severity",
    "infractionPoints" INTEGER,

    CONSTRAINT "Preset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomTag" (
    "id" SERIAL NOT NULL,
    "serverId" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "CustomTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Action" (
    "id" VARCHAR(255) NOT NULL,
    "serverId" VARCHAR(255) NOT NULL,
    "type" "Severity" NOT NULL,
    "logChannelId" VARCHAR(255),
    "logChannelMessage" VARCHAR(255),
    "executorId" VARCHAR(255) NOT NULL,
    "reason" TEXT,
    "triggerContent" TEXT,
    "infractionPoints" INTEGER NOT NULL,
    "channelId" VARCHAR(255),
    "targetId" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "expired" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Action_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "messageId" VARCHAR(255) NOT NULL,
    "serverId" VARCHAR(255) NOT NULL,
    "channelId" VARCHAR(255) NOT NULL,
    "authorId" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "embeds" JSONB,
    "isBot" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Message_pkey" PRIMARY KEY ("messageId")
);

-- CreateTable
CREATE TABLE "ForumTopic" (
    "forumTopicId" INTEGER NOT NULL,
    "serverId" VARCHAR(255) NOT NULL,
    "channelId" VARCHAR(255) NOT NULL,
    "authorId" VARCHAR(255) NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "embeds" JSONB,
    "isBot" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ForumTopic_pkey" PRIMARY KEY ("forumTopicId")
);

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
    "id" VARCHAR(255) NOT NULL,
    "serverId" VARCHAR(255) NOT NULL,
    "userFacingChannelId" VARCHAR(255) NOT NULL,
    "modFacingChannelId" VARCHAR(255) NOT NULL,
    "openerId" VARCHAR(255) NOT NULL,
    "handlingModerators" TEXT[],
    "closed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "ModmailThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModmailMessage" (
    "originalMessageId" VARCHAR(255) NOT NULL,
    "sentMessageId" VARCHAR(255) NOT NULL,
    "channelId" VARCHAR(255) NOT NULL,
    "authorId" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT NOT NULL,
    "modmailThreadId" TEXT NOT NULL,

    CONSTRAINT "ModmailMessage_pkey" PRIMARY KEY ("originalMessageId")
);

-- CreateTable
CREATE TABLE "Captcha" (
    "id" VARCHAR(255) NOT NULL,
    "value" VARCHAR(255),
    "serverId" VARCHAR(255) NOT NULL,
    "triggeringUser" VARCHAR(255) NOT NULL,
    "url" TEXT,
    "solved" BOOLEAN NOT NULL DEFAULT false,
    "hashedIp" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Captcha_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoleState" (
    "serverId" VARCHAR(255) NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "roles" INTEGER[] DEFAULT ARRAY[]::INTEGER[]
);

-- CreateTable
CREATE TABLE "Appeal" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "serverId" VARCHAR(255) NOT NULL,
    "creatorId" VARCHAR(255) NOT NULL,

    CONSTRAINT "Appeal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChannelIgnore" (
    "id" SERIAL NOT NULL,
    "serverId" VARCHAR(255) NOT NULL,
    "channelId" VARCHAR(255),
    "contentType" "ContentIgnoreType",
    "type" "ChannelIgnoreType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "ChannelIgnore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Server_serverId_key" ON "Server"("serverId");

-- CreateIndex
CREATE UNIQUE INDEX "LogChannel_serverId_channelId_type_key" ON "LogChannel"("serverId", "channelId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Role_serverId_roleId_type_key" ON "Role"("serverId", "roleId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "ContentFilter_serverId_content_matching_key" ON "ContentFilter"("serverId", "content", "matching");

-- CreateIndex
CREATE UNIQUE INDEX "UrlFilter_serverId_domain_subdomain_route_key" ON "UrlFilter"("serverId", "domain", "subdomain", "route");

-- CreateIndex
CREATE UNIQUE INDEX "InviteFilter_serverId_targetServerId_key" ON "InviteFilter"("serverId", "targetServerId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomTag_serverId_name_content_key" ON "CustomTag"("serverId", "name", "content");

-- CreateIndex
CREATE UNIQUE INDEX "Message_messageId_key" ON "Message"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "ForumTopic_serverId_forumTopicId_key" ON "ForumTopic"("serverId", "forumTopicId");

-- CreateIndex
CREATE UNIQUE INDEX "ReactionAction_serverId_channelId_messageId_emoteId_actionT_key" ON "ReactionAction"("serverId", "channelId", "messageId", "emoteId", "actionType");

-- CreateIndex
CREATE UNIQUE INDEX "RoleState_serverId_userId_key" ON "RoleState"("serverId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "ChannelIgnore_channelId_contentType_serverId_type_key" ON "ChannelIgnore"("channelId", "contentType", "serverId", "type");

-- AddForeignKey
ALTER TABLE "ModmailMessage" ADD CONSTRAINT "ModmailMessage_modmailThreadId_fkey" FOREIGN KEY ("modmailThreadId") REFERENCES "ModmailThread"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
