-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "content" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Preset" ADD COLUMN     "severity" "Severity";

-- AlterTable
ALTER TABLE "Server" ADD COLUMN     "antiHoist" BOOLEAN NOT NULL DEFAULT false;
