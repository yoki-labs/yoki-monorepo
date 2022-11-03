/*
  Warnings:

  - The values [PHRASE] on the enum `FilterMatching` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "FilterMatching_new" AS ENUM ('WORD', 'PREFIX', 'INFIX', 'POSTFIX');
ALTER TABLE "ContentFilter" ALTER COLUMN "matching" DROP DEFAULT;
ALTER TABLE "ContentFilter" ALTER COLUMN "matching" TYPE "FilterMatching_new" USING ("matching"::text::"FilterMatching_new");
ALTER TYPE "FilterMatching" RENAME TO "FilterMatching_old";
ALTER TYPE "FilterMatching_new" RENAME TO "FilterMatching";
DROP TYPE "FilterMatching_old";
ALTER TABLE "ContentFilter" ALTER COLUMN "matching" SET DEFAULT 'WORD';
COMMIT;
