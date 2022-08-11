/*
  Warnings:

  - You are about to drop the `LinkFilter` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Server" ADD COLUMN     "filterInvites" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "LinkFilter";

-- CreateTable
CREATE TABLE "UrlFilter" (
    "id" SERIAL NOT NULL,
    "serverId" VARCHAR(255) NOT NULL,
    "domain" VARCHAR(255) NOT NULL,
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
