/*
  Warnings:

  - You are about to drop the column `type` on the `Preset` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Preset" DROP COLUMN "type";

-- DropEnum
DROP TYPE "PresetType";
