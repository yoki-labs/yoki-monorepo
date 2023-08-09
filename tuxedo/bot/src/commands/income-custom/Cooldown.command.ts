import { DefaultIncomeType, RoleType } from "@prisma/client";
import { inlineCode } from "@yokilabs/bot";
import ms from "ms";

import { Category, Command } from "../commands";
import { defaultCreatedCooldown, defaultIncomes } from "../income/income-defaults";
import { DefaultIncomeTypeMap, defaultOrCustomIncomeDisplay } from "./income-util";

const SetCooldown: Command = {
    name: "income-cooldown",
    description: "Changes the cooldown of a built-in command.",
    subName: "cooldown",
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
            name: "time",
            display: "cooldown time",
            type: "time",
            optional: true,
            min: 1000,
        },
    ],
    execute: async (message, args, ctx) => {
        const command = (args.command as string).toLowerCase();
        const time = args.time as number | undefined;

        const incomeType = DefaultIncomeTypeMap[command] as DefaultIncomeType | undefined;

        const incomeOverride = await ctx.dbUtil.getIncomeOverride(message.serverId!, incomeType, command);

        if (!time) {
            const currentCooldown = incomeOverride?.cooldownMs ?? defaultIncomes[command]?.cooldown ?? defaultCreatedCooldown;

            return ctx.messageUtil.replyWithInfo(
                message,
                `Cooldown for ${command}`,
                `The current cooldown for ${inlineCode(command)} is ${ms(currentCooldown, { long: true })}.`
            );
        }

        await ctx.dbUtil.createOrUpdateIncome(message.serverId!, message.createdById, incomeType, command, incomeOverride, { cooldownMs: time });

        return ctx.messageUtil.replyWithSuccess(
            message,
            `Changed ${command}'s cooldown`,
            `The cooldown for ${command} has been changed to ${ms(time, { long: true })}.`
        );
    },
};

export default SetCooldown;
