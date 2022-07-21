/*
  Warnings:

  - You are about to drop the column `antiHoist` on the `Server` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ResponseType" AS ENUM ('CAPTCHA', 'KICK');

ALTER TABLE "Server" 
RENAME COLUMN "antiHoist" TO "antiHoistEnabled";

-- AlterTable
ALTER TABLE "Server" ADD COLUMN     "antiRaidEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "antiRaidResponse" "ResponseType",
ADD COLUMN     "modmailEnabled" BOOLEAN NOT NULL DEFAULT false;
