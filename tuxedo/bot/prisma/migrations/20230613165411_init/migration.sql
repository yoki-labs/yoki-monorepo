/*
  Warnings:

  - You are about to drop the column `amount` on the `Reward` table. All the data in the column will be lost.
  - Added the required column `maxAmount` to the `Reward` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minAmount` to the `Reward` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Reward" DROP COLUMN "amount",
ADD COLUMN     "maxAmount" INTEGER NOT NULL,
ADD COLUMN     "minAmount" INTEGER NOT NULL;
