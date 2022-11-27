/*
  Warnings:

  - The primary key for the `InviteFilter` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "InviteFilter" DROP CONSTRAINT "InviteFilter_pkey";

-- CreateTable
CREATE TABLE "Appeal" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "serverId" VARCHAR(255) NOT NULL,
	"creatorId" VARCHAR(255) NOT NULL,

    CONSTRAINT "Appeal_pkey" PRIMARY KEY ("id")
);
