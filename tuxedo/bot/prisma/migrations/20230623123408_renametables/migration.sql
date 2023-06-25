/*
  Warnings (no longer effective, but leaving it here):

  - You are about to drop the column `incomeOverrideId` on the `Reward` table. All the data in the column will be lost.
  - You are about to drop the `DefaultIncomeOverride` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `incomeCommandId` to the `Reward` table without a default value. This is not possible if the table is not empty.

*/

-- Manual: Rename table instead of removing it
ALTER TABLE IF EXISTS "DefaultIncomeOverride" RENAME TO "IncomeCommand";

-- Manual: Rename column instead of removing it
ALTER TABLE IF EXISTS "Reward" RENAME COLUMN "incomeOverrideId" TO "incomeCommandId";

-- Manual: Rename column instead of removing it
ALTER TABLE IF EXISTS "Reward" RENAME CONSTRAINT "Reward_incomeOverrideId_fkey" TO "Reward_incomeCommandId_fkey";