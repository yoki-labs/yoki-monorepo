import { DefaultIncomeType, RoleType } from "@prisma/client";

import { Category, Command } from "../commands";
import { inlineQuote } from "@yokilabs/bot";
import { DefaultIncomeTypeMap, displayDefaultRewards, displayOverridenRewards } from "./income-util";
import { stripIndents } from "common-tags";
import { EmbedField } from "guilded.js";
import { formatDate } from "@yokilabs/utils";
import ms from "ms";
import { defaultCooldowns, defaultCreatedCooldown } from "../income/income-util";

const Info: Command = {
    name: "income-info",
    description: "Gets information about an income command (default or created).",
    subName: "info",
    subCommand: true,
    category: Category.Economy,
    requiredRole: RoleType.MOD,
    args: [
        {
            name: "command",
            display: `${Object.keys(DefaultIncomeType).map(x => x.toLowerCase()).join(" / ")} / (custom income command)`,
            type: "string",
        },
    ],
    execute: async (message, args, ctx, { server: { timezone } }) => {
        const command = (args.command as string).toLowerCase();

        const incomeType = DefaultIncomeTypeMap[command] as DefaultIncomeType | undefined;

        const income = await ctx.dbUtil.getIncomeOverride(message.serverId!, incomeType, command);

        if (!(incomeType || income))
            return ctx.messageUtil.replyWithError(
                message,
                "Custom income not found",
                `There doesn't seem to be any income command by the name of ${inlineQuote(command)}.`
            );

        const currencies = await ctx.dbUtil.getCurrencies(message.serverId!);

        const displayName = incomeType?.toLowerCase() ?? command;

        return ctx.messageUtil.replyWithInfo(
            message,
            `Income ${inlineQuote(displayName)}`,
            `Info about ${incomeType ? "server's local income" : "default income"} with the name ${inlineQuote(displayName)}.`,
            {
                fields: [
                    {
                        name: "Rewards",
                        value: income?.rewards.length
                            ? displayOverridenRewards(income, currencies)
                            : displayDefaultRewards(incomeType!, currencies)
                    },
                    {
                        name: "Income Info",
                        value:
                            stripIndents`
                                **Cooldown:** ${ms(income?.cooldownMs ?? (incomeType ? defaultCooldowns[incomeType] : defaultCreatedCooldown), { long: true })}
                                **Fail chance:** 0%
                                **Fail percentage cut:** 0%
                            `
                    },
                    income && {
                        name: "Additional Info",
                        value: stripIndents`
                            **${incomeType ? "Override created" : "Created"} by:** <@${income.createdBy}>
                            **Created at:** ${formatDate(income.createdAt, timezone)}
                        `
                    }
                ].filter(Boolean) as EmbedField[]
            }
        );
    },
};

export default Info;
