/*
  Warnings:

  - The `locale` column on the `Server` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Language" AS ENUM ('EN_US', 'LT_LT');

-- AlterTable
ALTER TABLE "Server" DROP COLUMN "locale",
ADD COLUMN     "locale" "Language" NOT NULL DEFAULT E'EN_US';
