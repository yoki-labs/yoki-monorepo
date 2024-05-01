import { RoleType } from "@prisma/client";
import { inlineQuote } from "@yokilabs/bot";

import { Category, Command } from "../commands";

const SetCanTransfer: Command = {
    name: "items-cantransfer",
    description: "Changes whether an item can be transferred to another person.",
    subName: "cantransfer",
    subCommand: true,
    category: Category.Economy,
    requiredRole: RoleType.MOD,
    args: [
        {
            name: "id",
            display: "item ID",
            type: "string",
        },
        {
            name: "transferrable",
            type: "boolean",
        },
    ],
    execute: async (message, args, ctx) => {
        const itemId = args.id as string;
        const transferrable = args.transferrable as boolean;

        const item = await ctx.dbUtil.getItem(message.serverId!, itemId);

        if (!item) return ctx.messageUtil.replyWithError(message, "No such item", `Item with ID ${inlineQuote(itemId)} does not exist.`);

        await ctx.dbUtil.updateItem(item, {
            canTransfer: transferrable,
        });

        return ctx.messageUtil.replyWithSuccess(
            message,
            `Item transfer settings modified`,
            `The item ${inlineQuote(item.name)} can ${transferrable ? "now" : "no longer"} be transferred to another member.`
        );
    },
};

export default SetCanTransfer;
