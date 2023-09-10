-- DropForeignKey
ALTER TABLE "ItemValue" DROP CONSTRAINT "ItemValue_itemId_fkey";

-- DropForeignKey
ALTER TABLE "MemberBalance" DROP CONSTRAINT "MemberBalance_memberId_fkey";

-- DropForeignKey
ALTER TABLE "MemberItem" DROP CONSTRAINT "MemberItem_memberId_fkey";

-- DropForeignKey
ALTER TABLE "Reward" DROP CONSTRAINT "Reward_incomeCommandId_fkey";

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_incomeCommandId_fkey" FOREIGN KEY ("incomeCommandId") REFERENCES "IncomeCommand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemValue" ADD CONSTRAINT "ItemValue_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberBalance" ADD CONSTRAINT "MemberBalance_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "ServerMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberItem" ADD CONSTRAINT "MemberItem_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "ServerMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
