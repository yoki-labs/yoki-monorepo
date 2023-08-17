/*
  Warnings:

  - You are about to drop the column `maxAmount` on the `ItemValue` table. All the data in the column will be lost.
  - You are about to drop the column `minAmount` on the `ItemValue` table. All the data in the column will be lost.
  - Added the required column `amount` to the `ItemValue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ItemValue" DROP COLUMN "maxAmount",
DROP COLUMN "minAmount",
ADD COLUMN     "amount" INTEGER NOT NULL;
