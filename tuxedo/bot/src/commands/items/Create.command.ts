import { RoleType } from "@prisma/client";
import { inlineQuote } from "@yokilabs/bot";

import { Category, Command } from "../commands";

const Create: Command = {
    name: "items-create",
    description: "Creates a new item locally for this server.",
    subName: "create",
    subCommand: true,
    category: Category.Economy,
    requiredRole: RoleType.ADMIN,
    args: [
        {
            name: "name",
            type: "rest",
            max: 100,
        },
        {
            name: "canBuy",
            display: "can buy at store = yes",
            type: "boolean",
            optional: true
        },
    ],
    execute: async (message, args, ctx) => {
        const name = args.name as string;
        const canBuy = (args.canBuy as boolean | undefined) ?? true;

        await ctx.dbUtil.createItem(message.serverId!, message.createdById, name, canBuy);

        return ctx.messageUtil.replyWithSuccess(message, "Item created", `Item with tag ${inlineQuote(name)} has been successfully created.`);
    },
};

export default Create;
