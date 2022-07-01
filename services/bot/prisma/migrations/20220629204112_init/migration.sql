/*
  Warnings:

  - The primary key for the `ModmailThread` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "ModmailMessage" DROP CONSTRAINT "ModmailMessage_modmailThreadId_fkey";

-- AlterTable
ALTER TABLE "ModmailMessage" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "modmailThreadId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "ModmailThread" DROP CONSTRAINT "ModmailThread_pkey",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3),
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE VARCHAR(255),
ADD CONSTRAINT "ModmailThread_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "ModmailThread_id_seq";

-- AddForeignKey
ALTER TABLE "ModmailMessage" ADD CONSTRAINT "ModmailMessage_modmailThreadId_fkey" FOREIGN KEY ("modmailThreadId") REFERENCES "ModmailThread"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
