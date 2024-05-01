-- AlterTable
ALTER TABLE "Currency" ADD COLUMN     "transferRate" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "canTransfer" BOOLEAN NOT NULL DEFAULT false;
