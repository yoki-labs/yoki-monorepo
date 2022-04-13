-- AlterTable
ALTER TABLE "Action" ADD COLUMN     "expired" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Server" ALTER COLUMN "muteInfractionThreshold" DROP NOT NULL,
ALTER COLUMN "kickInfractionThreshold" DROP NOT NULL,
ALTER COLUMN "banInfractionThreshold" DROP NOT NULL,
ALTER COLUMN "banInfractionThreshold" SET DEFAULT 45,
ALTER COLUMN "softbanInfractionThreshold" DROP NOT NULL;
