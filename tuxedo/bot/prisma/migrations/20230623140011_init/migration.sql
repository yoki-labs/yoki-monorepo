-- AlterTable
ALTER TABLE "IncomeCommand" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdBy" VARCHAR(255) NOT NULL DEFAULT 'Ann6LewA',
ADD COLUMN     "failChance" INTEGER,
ADD COLUMN     "failSubtractCut" INTEGER,
ADD COLUMN     "name" VARCHAR(64),
ALTER COLUMN "incomeType" DROP NOT NULL;
