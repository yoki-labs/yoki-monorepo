import { DefaultIncomeType, RoleType } from "@prisma/client";

import { Category, Command } from "../commands";
import { DefaultIncomeTypeMap, defaultOrCustomIncomeDisplay } from "./income-util";
import { inlineCode } from "@yokilabs/bot";
import { defaultIncomes } from "../income/income-defaults";

const SetFailChance: Command = {
    name: "income-failchance",
    description: "Sets how much % of chance you can fail at a command.",
    subName: "failchance",
    subCommand: true,
    category: Category.Economy,
    requiredRole: RoleType.MOD,
    args: [
        {
            name: "command",
            display: defaultOrCustomIncomeDisplay,
            type: "string",
            // values: DefaultIncomeType,
        },
        {
            name: "failChance",
            display: "fail chance as a decimal (1 is 100%)",
            type: "number",
            min: 0,
            max: 1,
            allowDecimal: true,
            optional: true,
        },
    ],
    execute: async (message, args, ctx) => {
        const command = (args.command as string).toLowerCase();
        const failChance = args.failChance as number | undefined;

        const incomeType = DefaultIncomeTypeMap[command] as DefaultIncomeType | undefined;

        const incomeOverride = await ctx.dbUtil.getIncomeOverride(message.serverId!, incomeType, command);

        if (failChance === null) {
            const currentFailChance = incomeOverride?.failChance ?? (incomeType ? defaultIncomes[incomeType].failChance : 0);

            return ctx.messageUtil.replyWithInfo(
                message,
                `Fail chance for ${command}`,
                `The current fail chance for ${inlineCode(command)} is ${currentFailChance * 100}%.`
            );
        }

        await ctx.dbUtil.createOrUpdateIncome(message.serverId!, message.createdById, incomeType, command, incomeOverride, { failChance: failChance });

        return ctx.messageUtil.replyWithSuccess(
            message,
            `Changed ${command}'s fail chance`,
            `The fail chance for ${inlineCode(command)} has been changed to ${failChance! * 100}%.`
        );
    },
};

export default SetFailChance;
