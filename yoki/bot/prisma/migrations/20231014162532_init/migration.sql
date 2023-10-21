-- AlterEnum
ALTER TYPE "ChannelIgnoreType" ADD VALUE 'NSFW';

-- AlterTable
ALTER TABLE "Server" ADD COLUMN     "nsfwHentaiConfidence" DOUBLE PRECISION,
ADD COLUMN     "nsfwPornConfidence" DOUBLE PRECISION;
