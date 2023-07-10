import { Currency, DefaultIncomeType, IncomeCommand, Reward, RoleType } from "@prisma/client";
import { inlineCode, inlineQuote } from "@yokilabs/bot";
import { Message } from "guilded.js";

import { TuxoClient } from "../../Client";
import { Category, Command } from "../commands";
import { DefaultIncomeTypeMap, displayDefaultRewards, displayOverridenRewards } from "./income-util";

const SetCurrency: Command = {
    name: "income-currency",
    description: "Changes the received currency of a command.",
    subName: "currency",
    subCommand: true,
    category: Category.Economy,
    requiredRole: RoleType.MOD,
    args: [
        {
            name: "command",
            display: `${Object
                .keys(DefaultIncomeType)
                .slice(0, 3)
                .concat("...")
                .map((x) => x.toLowerCase())
                .join(" / ")} / (custom income command)`,
            type: "string",
        },
        {
            name: "currency",
            display: "currency tag",
            type: "string",
            optional: true,
        },
        {
            name: "min",
            display: "minimum amount",
            type: "number",
            optional: true,
        },
        {
            name: "max",
            display: "maximum amount",
            type: "number",
            optional: true,
        },
    ],
    execute: async (message, args, ctx) => {
        const command = (args.command as string).toLowerCase();
        const currencyTag = args.currency as string | undefined;
        const minAmount = args.min as number | undefined;
        const maxAmount = args.max as number | undefined;

        const incomeType = DefaultIncomeTypeMap[command] as DefaultIncomeType | undefined;

        const incomeOverride = await ctx.dbUtil.getIncomeOverride(message.serverId!, incomeType, command);
        const serverCurrencies = await ctx.dbUtil.getCurrencies(message.serverId!);

        if (!currencyTag)
            return ctx.messageUtil.replyWithInfo(
                message,
                `Rewards for ${command.toLowerCase()}`,
                incomeOverride?.rewards.length ? displayOverridenRewards(incomeOverride, serverCurrencies) : displayDefaultRewards(command, serverCurrencies)
            );

        // Rewarded currency
        const currency = serverCurrencies.find((x) => x.tag === currencyTag);

        if (!currency) return ctx.messageUtil.replyWithError(message, "No such currency", `There is no currency with tag ${inlineQuote(currencyTag)} in this server.`);

        if (typeof minAmount === "undefined" || typeof maxAmount === "undefined")
            return ctx.messageUtil.replyWithError(
                message,
                `Expected minimum and maximum amount`,
                `Please provide minimum and maximum amounts of ${currency.name} user should received from ${command.toLowerCase()}.`
            );

        if (minAmount === 0 && maxAmount === 0) return removeCurrencyReward(ctx, message, command, currency, incomeOverride);

        await ctx.dbUtil.createOrUpdateIncomeReward(message.serverId!, message.createdById, incomeType, command, incomeOverride, {
            serverId: message.serverId!,
            currencyId: currency.id,
            minAmount,
            maxAmount,
        });

        return ctx.messageUtil.replyWithSuccess(
            message,
            `Changed rewards for ${command.toLowerCase()}`,
            `Users will now be able to receive from ${inlineCode(minAmount)} to ${inlineCode(maxAmount)} of ${currency.name} while using ${command.toLowerCase()} command.`
        );
    },
};

async function removeCurrencyReward(
    ctx: TuxoClient,
    message: Message,
    incomeType: DefaultIncomeType | string,
    currency: Currency,
    incomeOverride: (IncomeCommand & { rewards: Reward[] }) | undefined
) {
    if (!incomeOverride || !incomeOverride.rewards.find((x) => x.currencyId === currency.id))
        return ctx.messageUtil.replyWithError(
            message,
            "Currency is not rewarded",
            `The currency is either not rewarded or is part of default rewards. If you want to remove default rewards, create a new reward for the income command.`
        );

    await ctx.prisma.reward.deleteMany({ where: { currencyId: currency.id, serverId: message.serverId!, incomeCommandId: incomeOverride.id } });

    return ctx.messageUtil.replyWithSuccess(message, "Rewarded currency removed", `The ${incomeType.toLowerCase()} will no longer hand out ${currency.name}.`);
}

export default SetCurrency;
