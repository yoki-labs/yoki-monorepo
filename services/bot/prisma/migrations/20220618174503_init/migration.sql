-- AlterTable
ALTER TABLE "Preset" ADD COLUMN     "severity" "Severity";

-- AlterTable
ALTER TABLE "Server" ADD COLUMN     "antiHoist" BOOLEAN NOT NULL DEFAULT false;
