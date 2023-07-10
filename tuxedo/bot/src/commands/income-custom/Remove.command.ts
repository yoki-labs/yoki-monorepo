import { DefaultIncomeType, RoleType } from "@prisma/client";
import { inlineQuote } from "@yokilabs/bot";

import { Category, Command } from "../commands";
import { nameRegex } from "./income-util";
import { Message } from "guilded.js";
import { TuxoClient } from "../../Client";
import { Server } from "../../typings";

const Remove: Command = {
    name: "income-remove",
    description: "Allows you to delete a custom income command or disable default one.",
    subName: "remove",
    subCommand: true,
    category: Category.Economy,
    requiredRole: RoleType.MOD,
    args: [
        {
            name: "name",
            display: "income command name",
            type: "string",
        },
    ],
    execute: async (message, args, ctx, { server }) => {
        const name = (args.name as string).toLowerCase();
        
        // Can have symbols that don't work with default incomes or existing incomes
        if (!nameRegex.test(name))
            return ctx.messageUtil.replyWithError(message, "Bad name format", `The name ${inlineQuote(name)} can only consist of letters, digits, \`-\` and \`_\`.`);

        const incomeType = DefaultIncomeType[(args.name as string).toUpperCase()];

        // Can't remove default income type; only disable it
        if (incomeType)
            return disableDefaultIncome(message, ctx, server, incomeType);

        const incomeCommands = await ctx.dbUtil.getIncomeOverrides(message.serverId!);
        const incomeCommand = incomeCommands.find((x) => x.name === name);

        // Can't delete something that doesn't exist
        if (!incomeCommand)
            return ctx.messageUtil.replyWithError(message, "Doesn't exist", `The income by the name of ${inlineQuote(name)} does not exist.`);

        await ctx.prisma.incomeCommand.delete({
            where: {
                id: incomeCommand.id,
            }
        });

        return ctx.messageUtil.replyWithSuccess(message, "Income delete", `The income ${inlineQuote(name)} has been successfully deleted.`);
    },
};

async function disableDefaultIncome(message: Message, ctx: TuxoClient, server: Server, incomeType: DefaultIncomeType) {
    const { disableDefaultIncomes } = server;

    // Can't disable it; it's already disabled
    if (disableDefaultIncomes.includes(incomeType))
        return ctx.messageUtil.replyWithError(message, "Already disabled", `The income ${inlineQuote(incomeType.toLowerCase())} is already disabled.`);

    await ctx.prisma.server.update({
        where: {
            id: server.id
        },
        data: {
            disableDefaultIncomes: disableDefaultIncomes.concat(incomeType)
        }
    });

    return ctx.messageUtil.replyWithSuccess(message, "Income disabled", `The income ${inlineQuote(incomeType.toLowerCase())} has been successfully disabled and can no longer be used.`);
}

export default Remove;
