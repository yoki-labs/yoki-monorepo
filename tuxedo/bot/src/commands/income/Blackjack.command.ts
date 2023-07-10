import { Currency, DefaultIncomeType, Reward } from "@prisma/client";
import { Category, Command } from "../commands";
import ms from "ms";
import { defaultIncomes } from "./income-defaults";
import { inlineQuote } from "@yokilabs/bot";

const defaultConfig = defaultIncomes[DefaultIncomeType.BLACKJACK];
const [defaultMin, defaultMax] = defaultConfig.reward;

export type BalanceChange = { currency: Currency, change: number };

const Blackjack: Command = {
    name: "blackjack",
    description: "Allows you to gamble a portion of your money.",
    aliases: ["gamble", "bl"],
    category: Category.Income,
    args: [
        {
            name: "currency",
            display: "currency to bet",
            type: "string",
        },
        {
            name: "amount",
            display: "amount to bet",
            type: "number",
        },
    ],
    execute: async (message, args, ctx) => {
        const tag = args.currency as string;
        const amount = Math.floor(args.amount as number);

        if (amount < 1)
            return ctx.messageUtil.replyWithError(message, "Can only bet at least 1", "Your betting amount should be at least 1 or more.");

        const currencies = await ctx.dbUtil.getCurrencies(message.serverId!);
        const selectedCurrency = currencies.find((x) => x.tag === tag);

        // Can't do blackjack if such currency doesn't exist
        if (!selectedCurrency)
            return ctx.messageUtil.replyWithError(message, "No such currency", `There is no currency with tag ${inlineQuote(tag)} in this server.`);

        const serverConfig = (await ctx.dbUtil.getIncomeOverrides(message.serverId!)).find((x) => x.incomeType === DefaultIncomeType.BLACKJACK);

        // Add random amounts of rewards that were configured or ones that are default
        const rewards: Pick<Reward, "currencyId" | "minAmount" | "maxAmount">[] = serverConfig?.rewards.length
            ? serverConfig.rewards
            : [{ currencyId: currencies[0].id, maxAmount: defaultMax, minAmount: defaultMin }];

        const reward = rewards.find((x) => x.currencyId === selectedCurrency.id);

        if (!reward)
            return ctx.messageUtil.replyWithError(message, "Can't use that currency", `The currency with the tag ${inlineQuote(selectedCurrency)} cannot be used in a bet.`);
        // The amount needs to be of the expected reward
        else if (amount < reward.minAmount || amount > reward.maxAmount)
            return ctx.messageUtil.replyWithError(message, "Incorrect amount of money", `The expected betting amount is between ${reward.minAmount} ${selectedCurrency.name} and ${reward.maxAmount} ${selectedCurrency.name}.`);

        const lastUsed = ctx.balanceUtil.getLastCommandUsage(message.serverId!, message.createdById, DefaultIncomeType.BLACKJACK);

        // Need to wait 24 hours or the configured time
        const localCooldown = serverConfig?.cooldownMs ?? defaultConfig.cooldown;

        if (lastUsed && Date.now() - lastUsed < localCooldown)
            return ctx.messageUtil.replyWithError(message, "Too fast", `You have to wait ${ms(lastUsed + localCooldown - Date.now(), { long: true })} to play blackjack again.`);

        // For the cooldown
        ctx.balanceUtil.updateLastCommandUsage(message.serverId!, message.createdById, DefaultIncomeType.BLACKJACK);

        const executorInfo = await ctx.dbUtil.getServerMember(message.serverId!, message.createdById);

        const balance = executorInfo?.balances.find((x) => x.currencyId === selectedCurrency.id)?.all ?? selectedCurrency.startingBalance ?? 0;

        // To make it balanced and require you to sacrifice your balance too
        if (balance < amount)
            return ctx.messageUtil.replyWithError(message, `Not enough currency`, `You are trying to place a bet with ${amount} ${selectedCurrency.name}, but you have ${balance} ${selectedCurrency.name} in total.`);

        return ctx.minigameUtil.initBlackJackInstance(message, selectedCurrency, amount);
    },
};

export default Blackjack;