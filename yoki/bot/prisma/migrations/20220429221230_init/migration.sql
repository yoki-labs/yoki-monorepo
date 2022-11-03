/*
  Warnings:

  - The values [FALLBACK] on the enum `LogChannelType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `triggerWord` on the `Action` table. All the data in the column will be lost.
  - You are about to drop the `Webhook` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "LogChannelType_new" AS ENUM ('ALL', 'MOD_ACTION_LOG', 'MEMBER_ROLES_UPDATE', 'MEMBER_UPDATE', 'MEMBER_JOIN_LEAVE', 'CHAT_MESSAGE_UPDATE', 'CHAT_MESSAGE_DELETE', 'NOTIFICATION');
ALTER TABLE "LogChannel" ALTER COLUMN "type" TYPE "LogChannelType_new" USING ("type"::text::"LogChannelType_new");
ALTER TYPE "LogChannelType" RENAME TO "LogChannelType_old";
ALTER TYPE "LogChannelType_new" RENAME TO "LogChannelType";
DROP TYPE "LogChannelType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Action" DROP COLUMN "triggerWord",
ADD COLUMN     "triggerContent" TEXT;

-- AlterTable
ALTER TABLE "LogChannel" ADD COLUMN     "webhookId" VARCHAR(255),
ADD COLUMN     "webhookToken" VARCHAR(255);

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- DropTable
DROP TABLE "Webhook";
