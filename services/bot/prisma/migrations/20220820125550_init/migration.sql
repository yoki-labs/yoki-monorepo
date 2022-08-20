-- CreateEnum
CREATE TYPE "PresetType" AS ENUM ('WORD', 'LINK');

-- AlterTable
ALTER TABLE "Preset" ADD COLUMN     "type" "PresetType" NOT NULL DEFAULT 'WORD';
