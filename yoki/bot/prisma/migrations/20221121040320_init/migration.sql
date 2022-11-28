-- AlterTable
ALTER TABLE "Server" ADD COLUMN     "appealChannel" VARCHAR(255);
ALTER TABLE "Server" ADD COLUMN     "appealsEnabled" BOOLEAN NOT NULL DEFAULT false;
