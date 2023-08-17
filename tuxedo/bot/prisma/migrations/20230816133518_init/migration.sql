-- AlterTable
ALTER TABLE "Server" ADD COLUMN     "sellCut" DOUBLE PRECISION NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "Item" (
    "id" VARCHAR(32) NOT NULL,
    "serverId" VARCHAR(255) NOT NULL,
    "name" VARCHAR(64) NOT NULL,
    "givesRoles" INTEGER[],
    "canBuy" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemValue" (
    "id" SERIAL NOT NULL,
    "serverId" VARCHAR(255) NOT NULL,
    "itemId" VARCHAR(32) NOT NULL,
    "currencyId" VARCHAR(255) NOT NULL,
    "minAmount" INTEGER NOT NULL,
    "maxAmount" INTEGER NOT NULL,

    CONSTRAINT "ItemValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberItem" (
    "id" SERIAL NOT NULL,
    "serverId" VARCHAR(255) NOT NULL,
    "memberId" VARCHAR(255) NOT NULL,
    "itemId" VARCHAR(32) NOT NULL,
    "amount" INTEGER NOT NULL,

    CONSTRAINT "MemberItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ItemValue" ADD CONSTRAINT "ItemValue_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberItem" ADD CONSTRAINT "MemberItem_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "ServerMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
