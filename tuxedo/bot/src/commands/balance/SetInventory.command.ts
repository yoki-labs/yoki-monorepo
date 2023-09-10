import { RoleType } from "@prisma/client";
import { inlineCode, inlineQuote } from "@yokilabs/bot";
import { Member } from "guilded.js";

import { Category, Command } from "../commands";

const SetInventory: Command = {
    name: "members-setinventory",
    description: "Sets member's inventory item count.",
    subName: "setinventory",
    subCommand: true,
    category: Category.Income,
    requiredRole: RoleType.MOD,
    args: [
        {
            name: "member",
            type: "member",
        },
        {
            name: "itemId",
            display: "item ID",
            type: "string",
        },
        {
            name: "amount",
            type: "number",
        },
    ],
    execute: async (message, args, ctx) => {
        const member = args.member as Member;
        const itemId = args.itemId as string;
        const amount = args.amount as number;

        const item = await ctx.dbUtil.getItem(message.serverId!, itemId);

        if (!item) return ctx.messageUtil.replyWithError(message, "No such item", `There is no item with ID ${inlineQuote(itemId)} in this server.`);

        // To not accidentally try creating new member info or remove everything they had in the bank,
        // despite only setting pocket
        const memberInfo = await ctx.dbUtil.getServerMember(message.serverId!, member.id);

        await ctx.dbUtil.updateServerMember(message.serverId!, member.id, memberInfo, [], { itemId, amount });

        return ctx.messageUtil.replyWithSuccess(
            message,
            "Inventory set",
            `<@${member.id}> (${inlineCode(member.id)}) had ${inlineQuote(item.name)} in their inventory successsfully changed to ${inlineCode(amount)}.`
        );
    },
};

export default SetInventory;
