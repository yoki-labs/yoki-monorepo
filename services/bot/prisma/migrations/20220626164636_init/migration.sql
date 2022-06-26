-- CreateEnum
CREATE TYPE "FilterMatching" AS ENUM ('WORD', 'PREFIX', 'INFIX', 'POSTFIX');

-- AlterTable
ALTER TABLE "ContentFilter" ADD COLUMN     "matching" "FilterMatching" NOT NULL DEFAULT E'WORD';
