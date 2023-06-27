import { DefaultIncomeType, RoleType } from "@prisma/client";
import { inlineCode, inlineQuote } from "@yokilabs/bot";

import { Category, Command } from "../commands";
import { defaultIncomes } from "../income/income-util";
import { DefaultIncomeTypeMap } from "./income-util";

const SetMessage: Command = {
    name: "income-message",
    description: "Changes the message of done action of an income command.",
    subName: "message",
    subCommand: true,
    category: Category.Economy,
    requiredRole: RoleType.MOD,
    args: [
        {
            name: "command",
            display: `${Object.keys(DefaultIncomeType)
                .map((x) => x.toLowerCase())
                .join(" / ")} / (custom income command)`,
            type: "string",
            // values: DefaultIncomeType,
        },
        {
            name: "action",
            type: "rest",
            optional: true,
            max: 50,
        },
    ],
    execute: async (message, args, ctx) => {
        const command = args.command as string;
        const action = args.action as string | undefined;

        const incomeType = DefaultIncomeTypeMap[command] as DefaultIncomeType | undefined;

        const incomeOverride = await ctx.dbUtil.getIncomeOverride(message.serverId!, incomeType, command);

        if (!action) {
            const currentAction = incomeOverride?.action ?? (incomeType ? defaultIncomes[incomeType].action : `Used ${command}`);

            return ctx.messageUtil.replyWithInfo(
                message,
                `Action message for ${command.toLowerCase()}`,
                `The current action message for ${inlineCode(command.toLowerCase())} is ${inlineQuote(currentAction)}.`
            );
        }

        await ctx.dbUtil.createOrUpdateIncome(message.serverId!, message.createdById, incomeType, command, incomeOverride, { action });

        return ctx.messageUtil.replyWithSuccess(
            message,
            `Changed ${command.toLowerCase()}'s action message`,
            `The action message for ${command.toLowerCase()} has been changed to ${inlineQuote(action)}.`
        );
    },
};

export default SetMessage;
