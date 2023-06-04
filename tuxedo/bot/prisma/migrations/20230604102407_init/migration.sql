-- AlterTable
ALTER TABLE "Server" ADD COLUMN     "isBankEnabled" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "ServerMember" ADD COLUMN     "bankBalance" JSONB,
ALTER COLUMN "balance" DROP NOT NULL;
