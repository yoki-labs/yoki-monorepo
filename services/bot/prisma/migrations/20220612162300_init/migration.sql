-- AlterEnum
ALTER TYPE "Severity" ADD VALUE 'NOTE';

-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "content" DROP NOT NULL;
