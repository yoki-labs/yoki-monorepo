import { RoleType } from "@prisma/client";
import { inlineCode, inlineQuote } from "@yokilabs/bot";

import { Category, Command } from "../commands";

const List: Command = {
    name: "items-list",
    description: "Lists all server's items.",
    subName: "list",
    subCommand: true,
    category: Category.Economy,
    requiredRole: RoleType.ADMIN,
    args: [
        {
            name: "page",
            type: "number",
            optional: true,
        },
    ],
    execute: async (message, args, ctx) => {
        const page = ((args.page as number | undefined) ?? 1) - 1;

        const items = await ctx.dbUtil.getItems(message.serverId!);

        if (!items.length) return ctx.messageUtil.replyWithNullState(message, "No items", `This server does not have any local items.`);

        return ctx.messageUtil.replyWithPaginatedContent({
            replyTo: message,
            title: "Server's items",
            items,
            itemsPerPage: 15,
            page,
            itemMapping: (x) => `[${inlineCode(x.id)}] ${inlineQuote(x.name)}`,
        });
    },
};

export default List;
