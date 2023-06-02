-- AlterTable
ALTER TABLE "Giveaway" ADD COLUMN     "hasEnded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "winners" TEXT[];
