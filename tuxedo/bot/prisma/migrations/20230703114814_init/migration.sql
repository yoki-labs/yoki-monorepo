-- AlterEnum
ALTER TYPE "DefaultIncomeType" ADD VALUE 'ROB';

-- AlterTable
ALTER TABLE "Currency" ADD COLUMN     "bankEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "canLose" BOOLEAN NOT NULL DEFAULT true;
