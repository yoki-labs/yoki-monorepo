import { DefaultIncomeType, RoleType } from "@prisma/client";
import { inlineCode } from "@yokilabs/bot";
import ms from "ms";

import { Category, Command } from "../commands";
import { defaultCooldowns } from "../income/income-util";

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
            display: Object.keys(DefaultIncomeType).map(x => x.toLowerCase()).join(" / "),
            type: "enum",
            values: DefaultIncomeType,
        },
        {
            name: "time",
            display: "cooldown time",
            type: "time",
            optional: true,
            min: 1000
        },
    ],
    execute: async (message, args, ctx) => {
        const { resolved: command } = args.command as { resolved: DefaultIncomeType };
        const time = args.time as number | undefined;

        const incomeOverride = await ctx.dbUtil.getIncomeOverride(message.serverId!, command);

        if (!time) {
            const currentCooldown = incomeOverride?.cooldownMs ?? defaultCooldowns[command];

            return ctx.messageUtil.replyWithInfo(
                message,
                `Cooldown for ${command.toLowerCase()}`,
                `The current cooldown for ${inlineCode(command.toLowerCase())} is ${ms(currentCooldown, { long: true })}.`
            );
        }

        await ctx.dbUtil.createOrUpdateIncomeOverride(message.serverId!, command, incomeOverride, time);

        return ctx.messageUtil.replyWithSuccess(message, `Changed ${command.toLowerCase()}'s cooldown`, `The cooldown for ${command.toLowerCase()} has been changed to ${ms(time, { long: true })}.`);
    },
};

export default SetCooldown;
