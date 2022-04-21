/*
  Warnings:

  - The values [FILTER] on the enum `LogChannelType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "LogChannelType_new" AS ENUM ('ALL', 'FALLBACK', 'MOD_ACTION_LOG', 'MEMBER_ROLES_UPDATE', 'MEMBER_UPDATE', 'MEMBER_JOIN_LEAVE', 'CHAT_MESSAGE_UPDATE', 'CHAT_MESSAGE_DELETE', 'NOTIFICATION');
ALTER TABLE "LogChannel" ALTER COLUMN "type" TYPE "LogChannelType_new" USING ("type"::text::"LogChannelType_new");
ALTER TYPE "LogChannelType" RENAME TO "LogChannelType_old";
ALTER TYPE "LogChannelType_new" RENAME TO "LogChannelType";
DROP TYPE "LogChannelType_old";
COMMIT;
