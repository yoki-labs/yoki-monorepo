-- CreateEnum
CREATE TYPE "ModuleName" AS ENUM ('ECONOMY', 'SHOP');

-- AlterTable
ALTER TABLE "Server" ADD COLUMN     "modulesDisabled" "ModuleName"[] DEFAULT ARRAY[]::"ModuleName"[];
