-- CreateEnum
CREATE TYPE "ChannelIgnoreType" AS ENUM ('AUTOMOD');

-- CreateTable
CREATE TABLE "ChannelIgnore" (
    "id" SERIAL NOT NULL,
    "channelId" VARCHAR(255) NOT NULL,
    "serverId" VARCHAR(255) NOT NULL,
    "type" "ChannelIgnoreType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "ChannelIgnore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChannelIgnore_channelId_serverId_type_key" ON "ChannelIgnore"("channelId", "serverId", "type");
