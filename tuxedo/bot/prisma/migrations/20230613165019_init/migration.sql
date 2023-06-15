-- CreateEnum
CREATE TYPE "DefaultIncomeType" AS ENUM ('DAILY', 'WORK', 'HOBBY');

-- CreateTable
CREATE TABLE "DefaultIncomeOverride" (
    "id" SERIAL NOT NULL,
    "serverId" VARCHAR(255) NOT NULL,
    "incomeType" "DefaultIncomeType" NOT NULL,
    "cooldownMs" INTEGER,

    CONSTRAINT "DefaultIncomeOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reward" (
    "id" SERIAL NOT NULL,
    "serverId" VARCHAR(255) NOT NULL,
    "incomeOverrideId" INTEGER NOT NULL,
    "currencyId" VARCHAR(255) NOT NULL,
    "amount" INTEGER NOT NULL,

    CONSTRAINT "Reward_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_incomeOverrideId_fkey" FOREIGN KEY ("incomeOverrideId") REFERENCES "DefaultIncomeOverride"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
