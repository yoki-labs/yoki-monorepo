import { DefaultIncomeType, RoleType } from "@prisma/client";
import { inlineCode, inlineQuote } from "@yokilabs/bot";
import { stripIndents } from "common-tags";

import { Category, Command } from "../commands";
import { defaultIncomes } from "../income/income-defaults";
import { DefaultIncomeTypeMap, defaultOrCustomIncomeDisplay } from "./income-util";

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
            display: defaultOrCustomIncomeDisplay,
            type: "string",
            // values: DefaultIncomeType,
        },
        {
            name: "action",
            type: "rest",
            optional: true,
            max: 750,
        },
    ],
    execute: async (message, args, ctx) => {
        const command = (args.command as string).toLowerCase();
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

        await ctx.dbUtil.createOrUpdateIncome(message.serverId!, message.createdById, incomeType, command, incomeOverride, {
            action: action
                .split("|")
                .map((x) => x.trim())
                .join("|"),
        });

        return ctx.messageUtil.replyWithSuccess(
            message,
            `Changed ${command.toLowerCase()}'s action messages`,
            stripIndents`
                The possible action messages for ${command.toLowerCase()} have been changed to:
                \`\`\`md
                ${action
                    .replaceAll("```", "'''")
                    .split("|")
                    .map((x) => x.trim())
                    .join("\n")}
                \`\`\`${action.split("{}").length === 1 ? `\n\u2022 **NOTE:** You can add rewards anywhere in the message by adding {}` : ""}${
                action.split("|").length === 1 ? `\n\u2022 **NOTE:** You can have multiple action messages by using | between each message variant` : ""
            }
            `
        );
    },
};

export default SetMessage;
