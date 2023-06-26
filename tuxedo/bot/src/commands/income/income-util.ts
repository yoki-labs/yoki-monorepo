import { DefaultIncomeType, MemberBalance } from "@prisma/client";
import { CommandContext, inlineCode, inlineQuote,ResolvedArgs } from "@yokilabs/bot";
import { Message } from "guilded.js";
import ms from "ms";

import { TuxoClient } from "../../Client";
import { Server } from "../../typings";

export const defaultCooldowns: Record<DefaultIncomeType, number> = {
    [DefaultIncomeType.DAILY]: 24 * 60 * 60 * 1000,
    [DefaultIncomeType.WORK]: 8 * 60 * 60 * 100,
    [DefaultIncomeType.HOBBY]: 2 * 60 * 60 * 1000,
};
export const defaultReceivedCurrency: Record<DefaultIncomeType, number[]> = {
    [DefaultIncomeType.DAILY]: [50, 250],
    [DefaultIncomeType.WORK]: [25, 75],
    [DefaultIncomeType.HOBBY]: [10, 40],
};

const bankCooldown = 5 * 60 * 60 * 1000;

export function generateBankCommand(balanceType: string, action: string, actionDone: string, depositMultiplier: number, getBalanceAmount: (balance: MemberBalance) => number) {
    return async (message: Message, args: Record<string, ResolvedArgs>, ctx: TuxoClient, _context: CommandContext<Server>) => {
        const amount = args.amount ? Math.floor(args.amount as number) : null;
        const tag = (args.tag as string).toLowerCase();

        if (amount && amount < 1) return ctx.messageUtil.replyWithError(message, "Amount must be more than 0", `The ${action} amount must be equal to or greater than 1.`);

        // To make robbery in the future more balanced (yes, the pun), add cooldowns to the depositing
        const lastUsed = ctx.balanceUtil.getLastCommandUsage(message.serverId!, message.createdById, "bank");

        // Need to wait 5 hours
        if (lastUsed && Date.now() - lastUsed < bankCooldown)
            return ctx.messageUtil.replyWithError(
                message,
                "Too fast",
                `You have to wait ${ms(lastUsed + bankCooldown - Date.now(), { long: true })} to use bank again.`
            );

        // Check existance and balance of members
        const member = await ctx.dbUtil.getServerMember(message.serverId!, message.createdById);

        if (!member?.balances.length) return ctx.messageUtil.replyWithError(message, "No balance", `You do not have any currency in your ${balanceType} balance to ${action} anything.`);

        const serverCurrencies = await ctx.dbUtil.getCurrencies(message.serverId!);
        const depositingCurrencies =
            tag === "all"
            ? serverCurrencies
            : serverCurrencies.filter((x) => x.tag === tag);

        // If there is no such currency and they are not depositing all currency, then error out
        // As we check if there is at least 1 item in .balances, tag === "all" will never have this as true
        if (!depositingCurrencies.length)
            return ctx.messageUtil.replyWithError(message, "No such currency", `There is no currency with tag ${inlineQuote(tag)} in this server.`);

        const depositingBalances =
            tag === "all"
            ? member.balances
            : member.balances.filter((x) =>
                depositingCurrencies.find((y) => y.id === x.currencyId)
            );

        const depositMap = {};

        // Fill in the deposit
        for (const depositingBalance of depositingBalances) {
            const balanceAmount = getBalanceAmount(depositingBalance);

            // Check if it can be deposited
            if (amount && balanceAmount < amount) {
                // Get the currency to display its name in the error
                const depositingCurrency = serverCurrencies.find((x) => x.id === depositingBalance.currencyId)!;

                return ctx.messageUtil.replyWithError(
                    message,
                    "Balance currency too low",
                    `You cannot ${action} ${inlineCode(amount)} ${depositingCurrency.name}, as your ${balanceType} balance only has ${balanceAmount} ${
                        depositingCurrency.name
                    }.`
                );
            }

            // If the amount was not specified, deposit all of what is in the pocket
            depositMap[depositingBalance.currencyId] = (amount ?? balanceAmount) * depositMultiplier;
        }

        ctx.balanceUtil.updateLastCommandUsage(message.serverId!, message.createdById, "bank");

        // Deposit into bank
        await ctx.dbUtil.depositMemberBalance(member, depositMap);

        // Reply with success
        return ctx.messageUtil.replyWithSuccess(message, `Balance ${actionDone}`, `You have successfully ${actionDone} ${depositingCurrencies.map((x) => `${depositMap[x.id] / depositMultiplier} ${x.name}`).join(", ")}.`);
    }
}

export function generateIncomeCommand(incomeType: DefaultIncomeType, action: string, successTitle: string, successDescription: string) {
    const defaultCooldown = defaultCooldowns[incomeType];
    const [defaultMin, defaultAdditionalMax] = defaultReceivedCurrency[incomeType];

    return async function execute(message: Message, _args: Record<string, ResolvedArgs>, ctx: TuxoClient, _context: CommandContext<Server>) {
        const currencies = await ctx.dbUtil.getCurrencies(message.serverId!);

        if (!currencies.length) return ctx.messageUtil.replyWithError(message, "No currencies", `This server does not have any local currencies ${action}.`);

        const serverConfig = await ctx.dbUtil.getIncomeOverride(message.serverId!, incomeType);

        const lastUsed = ctx.balanceUtil.getLastCommandUsage(message.serverId!, message.createdById, incomeType);

        // Need to wait 24 hours or the configured time
        const localCooldown = serverConfig?.cooldownMs ?? defaultCooldown;

        if (lastUsed && Date.now() - lastUsed < localCooldown)
            return ctx.messageUtil.replyWithError(message, "Too fast", `You have to wait ${ms(lastUsed + localCooldown - Date.now(), { long: true })} ${action} again.`);

        // For the cooldown
        ctx.balanceUtil.updateLastCommandUsage(message.serverId!, message.createdById, incomeType);

        const balanceAdded = {};

        // Add random amounts of rewards that were configured or ones that are default
        if (serverConfig?.rewards.length) {
            for (const reward of serverConfig.rewards)
                addReward(balanceAdded, reward.currencyId, reward.maxAmount - reward.minAmount, reward.minAmount);
        } else addReward(balanceAdded, currencies[0].id, defaultAdditionalMax, defaultMin);

        for (const currency of currencies) {
            balanceAdded[currency.id] = balanceAdded[currency.id] ?? 0;

            const userInfo = await ctx.dbUtil.getServerMember(message.serverId!, message.createdById);
            const balanceOfCurrency = userInfo?.balances.find((x) => x.currencyId === currency.id)?.all ?? 0;
            if (currency.maximumBalance) {
                if (balanceOfCurrency + balanceAdded[currency.id] > currency.maximumBalance) {
                    return ctx.messageUtil.replyWithError(
                        message,
                        "You're too rich!",
                        `Woah there cowboy, you have too much money!\n\nIf you were to claim this ${action} you would have ${balanceOfCurrency + balanceAdded[currency.id]} and the server's limit for this currency is ${currency.maximumBalance}.\nSpend some more and then try to ${action} again.`
                    );
                }
            }
        }

        await ctx.dbUtil.addToMemberBalance(message.serverId!, message.createdById, currencies, balanceAdded);

        // Reply with success
        const addedCurrencies = currencies.filter((x) => x.id in balanceAdded).map((x) => `${balanceAdded[x.id]} ${x.name}`);

        return ctx.messageUtil.replyWithSuccess(message, successTitle, `${successDescription}, which had ${addedCurrencies.join(", ")}.`);
    };
}

const addReward = (balanceAdded: Record<string, number>, currencyId: string, max: number, min: number) =>
    balanceAdded[currencyId] = Math.floor(Math.random() * max + min);