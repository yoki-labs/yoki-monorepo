/*
  Warnings:

  - You are about to drop the column `balance` on the `ServerMember` table. All the data in the column will be lost.
  - You are about to drop the column `bankBalance` on the `ServerMember` table. All the data in the column will be lost.

*/

-- CreateTable
CREATE TABLE "MemberBalance" (
    "id" SERIAL NOT NULL,
    "serverId" VARCHAR(255) NOT NULL,
    "memberId" VARCHAR(255) NOT NULL,
    "currencyId" VARCHAR(255) NOT NULL,
    "pocket" INTEGER NOT NULL DEFAULT 0,
    "bank" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MemberBalance_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MemberBalance" ADD CONSTRAINT "MemberBalance_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "ServerMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- MANUAL: Converting JSON balances to SQL balances
INSERT INTO "MemberBalance"("serverId", "memberId", "currencyId", "pocket", "bank")
SELECT
  "ServerMember"."serverId" as "serverId",
  "ServerMember"."id" as "memberId",
  memberBalance.key as "currencyId",
  memberBalance.value::int as "pocket",
  coalesce(memberBankBalance.value::int, 0) as "bank"
FROM "ServerMember", jsonb_each_text("ServerMember"."balance") memberBalance
LEFT JOIN jsonb_each_text("ServerMember"."bankBalance") memberBankBalance ON memberBankBalance.key = memberBalance.key;

-- AlterTable
ALTER TABLE "ServerMember" DROP COLUMN "balance",
DROP COLUMN "bankBalance";