import { DefaultIncomeType, RoleType } from "@prisma/client";
import { inlineCode } from "@yokilabs/bot";

import { Category, Command } from "../commands";
import { defaultIncomes } from "../income/income-defaults";
import { DefaultIncomeTypeMap, defaultOrCustomIncomeDisplay } from "./income-util";

const SetFailCut: Command = {
    name: "income-failcut",
    description: "Sets how much % of points you lose if you fail at a command.",
    subName: "failcut",
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
            name: "failCut",
            display: "fail cut as a decimal (1 is 100%)",
            type: "number",
            min: 0,
            max: 10,
            allowDecimal: true,
            optional: true,
        },
    ],
    execute: async (message, args, ctx) => {
        const command = (args.command as string).toLowerCase();
        const failCut = args.failCut as number | null;

        const incomeType = DefaultIncomeTypeMap[command] as DefaultIncomeType | undefined;

        const incomeOverride = await ctx.dbUtil.getIncomeOverride(message.serverId!, incomeType, command);

        if (failCut === null) {
            const currentFailCut = incomeOverride?.failSubtractCut ?? (incomeType ? defaultIncomes[incomeType].failCut : 0);

            return ctx.messageUtil.replyWithInfo(message, `Fail cut for ${command}`, `The current fail cut for ${inlineCode(command)} is ${currentFailCut * 100}%.`);
        }

        await ctx.dbUtil.createOrUpdateIncome(message.serverId!, message.createdById, incomeType, command, incomeOverride, { failSubtractCut: failCut });

        return ctx.messageUtil.replyWithSuccess(message, `Changed ${command}'s fail cut`, `The fail cut for ${inlineCode(command)} has been changed to ${failCut! * 100}%.`);
    },
};

export default SetFailCut;
