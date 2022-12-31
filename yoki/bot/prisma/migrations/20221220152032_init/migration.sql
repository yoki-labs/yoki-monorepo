/*
  Warnings:

  - A unique constraint covering the columns `[channelId,contentType,serverId,type]` on the table `ChannelIgnore` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ContentIgnoreType" AS ENUM ('MESSAGE', 'FORUM_TOPIC', 'FORUM_REPLY', 'LIST_ITEM');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ChannelIgnoreType" ADD VALUE 'URL';
ALTER TYPE "ChannelIgnoreType" ADD VALUE 'INVITE';

-- DropIndex
DROP INDEX "ChannelIgnore_channelId_serverId_type_key";

-- AlterTable
ALTER TABLE "ChannelIgnore" ADD COLUMN     "contentType" "ContentIgnoreType",
ALTER COLUMN "channelId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ChannelIgnore_channelId_contentType_serverId_type_key" ON "ChannelIgnore"("channelId", "contentType", "serverId", "type");
