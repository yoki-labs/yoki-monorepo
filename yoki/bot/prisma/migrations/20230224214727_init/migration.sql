/*
  Warnings:

  - The values [FORUM_REPLY] on the enum `ContentIgnoreType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ContentIgnoreType_new" AS ENUM ('MESSAGE', 'FORUM_TOPIC', 'COMMENT', 'LIST_ITEM');
ALTER TABLE "ChannelIgnore" ALTER COLUMN "contentType" TYPE "ContentIgnoreType_new" USING ("contentType"::text::"ContentIgnoreType_new");
ALTER TYPE "ContentIgnoreType" RENAME TO "ContentIgnoreType_old";
ALTER TYPE "ContentIgnoreType_new" RENAME TO "ContentIgnoreType";
DROP TYPE "ContentIgnoreType_old";
COMMIT;

-- AlterEnum
ALTER TYPE "LogChannelType" ADD VALUE 'comment_deletions';
