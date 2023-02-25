-- AlterTable
ALTER TABLE "Server" ALTER COLUMN "muteInfractionThreshold" SET DEFAULT 15,
ALTER COLUMN "kickInfractionThreshold" SET DEFAULT 30,
ALTER COLUMN "banInfractionThreshold" SET DEFAULT 65,
ALTER COLUMN "softbanInfractionThreshold" SET DEFAULT 45;
