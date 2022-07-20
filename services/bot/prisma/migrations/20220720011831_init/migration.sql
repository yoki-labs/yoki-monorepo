/*
  Warnings:

  - You are about to drop the column `removeNsfw` on the `Server` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Server" DROP COLUMN "removeNsfw",
ADD COLUMN     "scanNSFW" BOOLEAN NOT NULL DEFAULT false;
