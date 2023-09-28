import { RoleType } from "@prisma/client";
import { inlineQuote } from "@yokilabs/bot";
import { Category, Command } from "../commands";

const SetName: Command = {
    name: "items-name",
    description: "Changes the name of an item.",
    subName: "name",
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
            name: "newName",
            type: "string",
            max: 100,
        },
    ],
    execute: async (message, args, ctx) => {
        const itemId = args.id as string;
        const newName = args.newName as string;

        const item = await ctx.dbUtil.getItem(message.serverId!, itemId);

        if (!item) return ctx.messageUtil.replyWithError(message, "No such item", `Item with ID ${inlineQuote(itemId)} does not exist.`);;

        await ctx.dbUtil.updateItem(item, {
            name: newName,
        });

        return ctx.messageUtil.replyWithSuccess(message, `Changed item's name`, `The item has been renamed from ${inlineQuote(item.name)} to ${inlineQuote(newName)}.`);
    },
};

export default SetName;
