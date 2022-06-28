-- CreateEnum
CREATE TYPE "Language" AS ENUM ('EN_US', 'LT_LT');

-- AlterTable
ALTER TABLE "Server" ADD COLUMN     "language" "Language" NOT NULL DEFAULT E'EN_US';
