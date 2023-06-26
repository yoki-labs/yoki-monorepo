import { RoleType } from "@prisma/client";

import { Category, Command } from "../commands";
import { inlineQuote } from "@yokilabs/bot";

const List: Command = {
    name: "income-list",
    description: "Gets a list of server's custom income commands.",
    subName: "list",
    subCommand: true,
    category: Category.Economy,
    requiredRole: RoleType.MOD,
    execute: async (message, _args, ctx) => {
        const incomes = await ctx.dbUtil.getIncomeOverrides(message.serverId!);

        return ctx.messageUtil.replyWithList(
            message,
            "Custom incomes",
            incomes
                .filter((income) => income.name)
                .map((income) => `\u2022 ${inlineQuote(income.name)}`),
        )
    },
};

export default List;
