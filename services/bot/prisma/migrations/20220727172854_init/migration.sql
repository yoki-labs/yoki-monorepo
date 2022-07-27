/*
  Warnings:

  - Added the required column `url` to the `Captcha` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Captcha" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "solved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "url" TEXT NOT NULL;
