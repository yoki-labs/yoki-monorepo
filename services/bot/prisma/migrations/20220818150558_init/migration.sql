-- AlterTable
ALTER TABLE "Server" ADD COLUMN     "urlFilterInfractionPoints" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "urlFilterSeverity" "Severity" NOT NULL DEFAULT 'WARN';
