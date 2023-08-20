import { RoleType } from "@prisma/client";
import { inlineQuote } from "@yokilabs/bot";

import { createServerLimit } from "../../util/premium";
import { Category, Command } from "../commands";

const getServerLimit = createServerLimit({
    Gold: 60,
    Silver: 45,
    Copper: 35,
    Early: 30,
    Default: 20,
});

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
            type: "string",
            max: 100,
        },
        {
            name: "canBuy",
            display: "can buy at store = yes",
            type: "boolean",
            optional: true,
        },
    ],
    execute: async (message, args, ctx, { server }) => {
        const name = args.name as string;
        const canBuy = (args.canBuy as boolean | undefined) ?? true;

        const serverItems = await ctx.dbUtil.getItems(message.serverId!);

        // To not create too many of them for DB to blow up
        const serverLimit = getServerLimit(server);

        if (serverItems.length >= serverLimit)
            return ctx.messageUtil.replyWithError(
                message,
                "Too many items",
                `You can only have ${serverLimit} items per server.${server.premium ? "" : "\n\n**Note:** You can upgrade to premium to increase the limit."}`
            );

        await ctx.dbUtil.createItem(message.serverId!, message.createdById, name, canBuy);

        return ctx.messageUtil.replyWithSuccess(message, "Item created", `Item with tag ${inlineQuote(name)} has been successfully created.`);
    },
};

export default Create;
