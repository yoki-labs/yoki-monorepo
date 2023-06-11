-- AlterTable
ALTER TABLE "MemberBalance" ADD COLUMN     "all" INTEGER NOT NULL DEFAULT 0;
-- Manual: Add the sum early for easier migrations
UPDATE "MemberBalance" SET "all" = pocket + bank;