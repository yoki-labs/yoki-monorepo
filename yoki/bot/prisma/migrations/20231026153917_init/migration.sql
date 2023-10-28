-- CreateEnum
CREATE TYPE "AppealStatus" AS ENUM ('ACCEPTED', 'DECLINED');

-- AlterTable
ALTER TABLE "Appeal" ADD COLUMN     "staffNote" TEXT,
ADD COLUMN     "status" "AppealStatus";
