/*
  Warnings:

  - Added the required column `messageId` to the `Giveaway` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Giveaway" ADD COLUMN     "messageId" VARCHAR(255) NOT NULL;
