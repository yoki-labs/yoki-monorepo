/*
  Warnings:

  - The `premium` column on the `Server` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "PremiumType" AS ENUM ('Gold', 'Silver');

-- AlterTable
ALTER TABLE "Server" DROP COLUMN "premium",
ADD COLUMN     "premium" "PremiumType";
