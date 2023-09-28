import { RoleType } from "@prisma/client";
import { inlineQuote } from "@yokilabs/bot";
import { Category, Command } from "../commands";

const SetCanBuy: Command = {
    name: "items-canbuy",
    description: "Changes whether an item can be bought at the store.",
    subName: "canbuy",
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
            name: "buyable",
            type: "boolean",
        },
    ],
    execute: async (message, args, ctx) => {
        const itemId = args.id as string;
        const buyable = args.buyable as boolean;

        const item = await ctx.dbUtil.getItem(message.serverId!, itemId);

        if (!item) return ctx.messageUtil.replyWithError(message, "No such item", `Item with ID ${inlineQuote(itemId)} does not exist.`);;

        await ctx.dbUtil.updateItem(item, {
            canBuy: buyable,
        });

        return ctx.messageUtil.replyWithSuccess(message, buyable ? `Item added to the shop` : `Item removed from the shop`, `The item ${inlineQuote(item.name)} can ${buyable ? "now be bought at the shop" : "no longer be bought at the shop"}.`);
    },
};

export default SetCanBuy;
