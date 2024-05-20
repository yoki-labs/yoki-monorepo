-- AlterTable
ALTER TABLE "Server" ADD COLUMN     "welcomeChannel" VARCHAR(48),
ADD COLUMN     "welcomeEnabled" BOOLEAN NOT NULL DEFAULT false;
