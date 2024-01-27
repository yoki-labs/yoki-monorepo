import { DefaultIncomeType, RoleType } from "@prisma/client";
import { codeBlock, inlineQuote } from "@yokilabs/bot";
import { formatDate } from "@yokilabs/utils";
import { stripIndents } from "common-tags";
import { EmbedField } from "guilded.js";
import ms from "ms";

import { Category, Command } from "../commands";
import { defaultCreatedCooldown, defaultIncomes } from "../income/income-defaults";
import { DefaultIncomeTypeMap, defaultOrCustomIncomeDisplay, displayDefaultRewards, displayOverridenRewards } from "./income-util";

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
            display: defaultOrCustomIncomeDisplay,
            type: "string",
        },
    ],
    execute: async (message, args, ctx, { server: { timezone, disableDefaultIncomes } }) => {
        const command = (args.command as string).toLowerCase();

        const incomeType = DefaultIncomeTypeMap[command] as DefaultIncomeType | undefined;

        const income = await ctx.dbUtil.getIncomeOverride(message.serverId!, incomeType, command);

        if (!(incomeType || income))
            return ctx.messageUtil.replyWithError(message, "Custom income not found", `There doesn't seem to be any income command by the name of ${inlineQuote(command)}.`);

        const currencies = await ctx.dbUtil.getCurrencies(message.serverId!);

        const displayName = incomeType?.toLowerCase() ?? command;

        const defaultIncomeInfo = incomeType ? defaultIncomes[incomeType] : null;

        const incomeBadge = incomeType && disableDefaultIncomes.includes(incomeType) ? ":red_circle: " : "";

        return ctx.messageUtil.replyWithInfo(
            message,
            `${incomeBadge}Income ${inlineQuote(displayName)}`,
            `Info about ${incomeType ? "server's local income" : "default income"} with the name ${inlineQuote(displayName)}.`,
            {
                fields: [
                    {
                        name: "Rewards",
                        value: income?.rewards.length ? displayOverridenRewards(income.rewards, currencies) : displayDefaultRewards(incomeType!, currencies),
                    },
                    {
                        name: "Income Info",
                        value: stripIndents`
                                **Cooldown:** ${ms(income?.cooldownMs ?? defaultIncomeInfo?.cooldown ?? defaultCreatedCooldown, { long: true })}
                                **Fail chance:** ${(income?.failChance ?? defaultIncomeInfo?.failChance ?? 0) * 100}%
                                **Fail percentage cut:** ${(income?.failSubtractCut ?? defaultIncomeInfo?.failCut ?? 0) * 100}%
                            `,
                    },
                    {
                        name: "Action messages",
                        value: codeBlock(income?.action?.split("|").join("\n") ?? defaultIncomeInfo?.action.join("\n") ?? `You have used ${income!.name}, which gave you {}.`, "md"),
                    },
                    income && {
                        name: "Additional Info",
                        value: stripIndents`
                            **${incomeType ? "Override created" : "Created"} by:** <@${income.createdBy}>
                            **Created at:** ${formatDate(income.createdAt, timezone)}
                        `,
                    },
                ].filter(Boolean) as EmbedField[],
            }
        );
    },
};

export default Info;
