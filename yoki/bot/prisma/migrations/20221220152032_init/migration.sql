/*
  Warnings:

  - A unique constraint covering the columns `[channelId,contentType,serverId,type]` on the table `ChannelIgnore` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ContentIgnoreType" AS ENUM ('MESSAGE', 'FORUM_TOPIC', 'FORUM_REPLY', 'LIST_ITEM');

-- DropIndex
DROP INDEX "ChannelIgnore_channelId_serverId_type_key";

-- AlterTable
ALTER TABLE "ChannelIgnore" ADD COLUMN     "contentType" "ContentIgnoreType",
ALTER COLUMN "channelId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ChannelIgnore_channelId_contentType_serverId_type_key" ON "ChannelIgnore"("channelId", "contentType", "serverId", "type");
