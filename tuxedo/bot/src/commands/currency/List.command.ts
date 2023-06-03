import { inlineCode, inlineQuote } from "@yokilabs/bot";
import { Category, Command } from "../commands";
import { RoleType } from "@prisma/client";

const List: Command = {
    name: "currency-list",
    description: "Lists all server's currencies.",
    subName: "list",
    subCommand: true,
    category: Category.Economy,
    requiredRole: RoleType.ADMIN,
    execute: async (message, _args, ctx) => {
        const currencies = await ctx.dbUtil.getCurrencies(message.serverId!);

        if (!currencies.length)
            return ctx.messageUtil.replyWithNullState(message, "No currencies", `This server does not have any local currencies.`);

        return ctx.messageUtil.replyWithInfo(
            message,
            "Server's currencies",
            currencies
                .map(x => `- ${inlineQuote(x.name)} (${inlineCode(x.tag)})`)
                .join("\n")
        );
    },
};

export default List;
