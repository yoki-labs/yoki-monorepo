import { DefaultIncomeType, RoleType } from "@prisma/client";
import { inlineQuote, ResolvedEnum } from "@yokilabs/bot";

import { Category, Command } from "../commands";

const Enable: Command = {
    name: "income-enable",
    description: "Allows you to re-enable a default income command.",
    subName: "enable",
    subCommand: true,
    category: Category.Economy,
    requiredRole: RoleType.MOD,
    args: [
        {
            name: "incomeType",
            display: Object.keys(DefaultIncomeType)
                .slice(0, 3)
                .concat("...")
                .map((x) => x.toLowerCase())
                .join(" / "),
            type: "enum",
            values: DefaultIncomeType,
        },
    ],
    execute: async (message, args, ctx, { server }) => {
        const { resolved: incomeType } = args.incomeType as ResolvedEnum;
        const { disableDefaultIncomes } = server;

        // Can't disable it; it's already disabled
        if (!disableDefaultIncomes.includes(incomeType as DefaultIncomeType))
            return ctx.messageUtil.replyWithError(message, "Already enabled", `The income ${inlineQuote(incomeType.toLowerCase())} is already enabled.`);

        await ctx.prisma.server.update({
            where: {
                id: server.id,
            },
            data: {
                disableDefaultIncomes: disableDefaultIncomes.filter((x) => x !== incomeType),
            },
        });

        return ctx.messageUtil.replyWithSuccess(
            message,
            "Income enabled",
            `The income ${inlineQuote(incomeType.toLowerCase())} has been successfully re-enabled and can be used again.`
        );
    },
};

export default Enable;
