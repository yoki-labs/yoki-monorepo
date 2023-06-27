/*
  Warnings:

  - You are about to alter the column `action` on the `IncomeCommand` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.

*/
-- AlterTable
ALTER TABLE "IncomeCommand" ALTER COLUMN "action" SET DATA TYPE VARCHAR(50);
