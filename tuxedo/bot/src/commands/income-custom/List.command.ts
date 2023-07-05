import { RoleType } from "@prisma/client";
import { inlineQuote } from "@yokilabs/bot";
import ms from "ms";

import { Category, Command } from "../commands";
import { defaultCreatedCooldown } from "../income/income-defaults";

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
            incomes.filter((income) => income.name).map((income) => `\u2022 ${inlineQuote(income.name)} — ${ms(income.cooldownMs ?? defaultCreatedCooldown, { long: true })}`)
        );
    },
};

export default List;
