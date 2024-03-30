-- AlterTable
ALTER TABLE "Server" ADD COLUMN     "actionNotificationChannel" VARCHAR(48),
ADD COLUMN     "nsfwInfractionPoints" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "nsfwSeverity" "Severity" NOT NULL DEFAULT 'WARN';
