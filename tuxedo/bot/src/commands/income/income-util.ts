import { Currency, DefaultIncomeType, IncomeCommand, MemberBalance, Reward } from "@prisma/client";
import { CommandContext, inlineCode, inlineQuote, ResolvedArgs } from "@yokilabs/bot";

import { Message } from "guilded.js";
import ms from "ms";

import { TuxoClient } from "../../Client";
import { Server } from "../../typings";

export const defaultIncomes: Record<DefaultIncomeType, { reward: number[]; cooldown: number; action: string }> = {
    [DefaultIncomeType.DAILY]: {
        reward: [50, 250],
        cooldown: 24 * 60 * 60 * 1000,
        action: "Claimed a daily reward",
    },
    [DefaultIncomeType.WORK]: {
        reward: [25, 75],
        cooldown: 8 * 60 * 60 * 1000,
        action: "Claimed your wage",
    },
    [DefaultIncomeType.HOBBY]: {
        reward: [10, 40],
        cooldown: 2 * 60 * 60 * 1000,
        action: "Received some hobby donations",
    },
};
export const defaultCreatedCooldown = 6 * 60 * 60 * 1000;
export const defaultCreatedReceivedCurrency = [25, 25];

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
            return ctx.messageUtil.replyWithError(message, "Too fast", `You have to wait ${ms(lastUsed + bankCooldown - Date.now(), { long: true })} to use bank again.`);

        // Check existance and balance of members
        const member = await ctx.dbUtil.getServerMember(message.serverId!, message.createdById);

        if (!member?.balances.length)
            return ctx.messageUtil.replyWithError(message, "No balance", `You do not have any currency in your ${balanceType} balance to ${action} anything.`);

        const serverCurrencies = await ctx.dbUtil.getCurrencies(message.serverId!);
        const depositingCurrencies = tag === "all" ? serverCurrencies : serverCurrencies.filter((x) => x.tag === tag);

        // If there is no such currency and they are not depositing all currency, then error out
        // As we check if there is at least 1 item in .balances, tag === "all" will never have this as true
        if (!depositingCurrencies.length) return ctx.messageUtil.replyWithError(message, "No such currency", `There is no currency with tag ${inlineQuote(tag)} in this server.`);

        const depositingBalances = tag === "all" ? member.balances : member.balances.filter((x) => depositingCurrencies.find((y) => y.id === x.currencyId));

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
                    `You cannot ${action} ${inlineCode(amount)} ${depositingCurrency.name}, as your ${balanceType} balance only has ${balanceAmount} ${depositingCurrency.name}.`
                );
            }

            // If the amount was not specified, deposit all of what is in the pocket
            depositMap[depositingBalance.currencyId] = (amount ?? balanceAmount) * depositMultiplier;
        }

        ctx.balanceUtil.updateLastCommandUsage(message.serverId!, message.createdById, "bank");

        // Deposit into bank
        await ctx.dbUtil.depositMemberBalance(member, depositMap);

        // Reply with success
        return ctx.messageUtil.replyWithSuccess(
            message,
            `Balance ${actionDone}`,
            `You have successfully ${actionDone} ${depositingCurrencies.map((x) => `${depositMap[x.id] / depositMultiplier} ${x.name}`).join(", ")}.`
        );
    };
}

type BalanceChange = Pick<MemberBalance, "currencyId" | "pocket" | "bank"> & { currency: Currency, added: number, lost?: number };

export function generateIncomeCommand(incomeType: DefaultIncomeType) {
    const {
        cooldown,
        action,
        reward: [defaultMin, defaultAdditionalMax],
    } = defaultIncomes[incomeType];

    return async function execute(message: Message, _args: Record<string, ResolvedArgs>, ctx: TuxoClient, _context: CommandContext<Server>) {
        const currencies = await ctx.dbUtil.getCurrencies(message.serverId!);

        if (!currencies.length) return ctx.messageUtil.replyWithError(message, "No currencies", `This server does not have any local currencies ${action}.`);

        const serverConfig = (await ctx.dbUtil.getIncomeOverrides(message.serverId!)).find((x) => x.incomeType === incomeType);

        return useIncomeCommand(incomeType, action, cooldown, defaultAdditionalMax, defaultMin, serverConfig, currencies, ctx, message);
    };
}

export async function useCustomIncomeCommand(ctx: TuxoClient, message: Message, income: IncomeCommand & { rewards: Reward[] }) {
    const currencies = await ctx.dbUtil.getCurrencies(message.serverId!);

    if (!currencies.length)
        return ctx.messageUtil.replyWithError(message, "No currencies", `This server does not have any local currencies to use ${inlineQuote(income.name)} income command.`);

    return useIncomeCommand(
        income.name!,
        `Used ${income.name}`,
        defaultCreatedCooldown,
        defaultCreatedReceivedCurrency[0],
        defaultCreatedReceivedCurrency[1],
        income,
        currencies,
        ctx,
        message
    );
}

async function useIncomeCommand(
    commandName: string,
    defaultAction: string,
    defaultCooldown: number,
    defaultAdditionalMax: number,
    defaultMin: number,
    income: (IncomeCommand & { rewards: Reward[] }) | undefined,
    currencies: Currency[],
    ctx: TuxoClient,
    message: Message
) {
    const lastUsed = ctx.balanceUtil.getLastCommandUsage(message.serverId!, message.createdById, commandName);

    // Need to wait 24 hours or the configured time
    const localCooldown = income?.cooldownMs ?? defaultCooldown;

    if (lastUsed && Date.now() - lastUsed < localCooldown)
        return ctx.messageUtil.replyWithError(message, "Too fast", `You have to wait ${ms(lastUsed + localCooldown - Date.now(), { long: true })} to use ${commandName} again.`);

    // For the cooldown
    ctx.balanceUtil.updateLastCommandUsage(message.serverId!, message.createdById, commandName);

    // Add random amounts of rewards that were configured or ones that are default
    const rewards: Pick<Reward, "currencyId" | "minAmount" | "maxAmount">[] = serverConfig?.rewards.length
        ? serverConfig.rewards
        : [{ currencyId: currencies[0].id, maxAmount: defaultAdditionalMax + defaultMin, minAmount: defaultMin }];

    const userInfo = await ctx.dbUtil.getServerMember(message.serverId!, message.createdById);

    const newBalance: BalanceChange[] = [];

    for (const reward of rewards) {
        // The opposite could be done, but this means adding additional `continue` if reward for that currency
        // doesn't exist, yada yada
        const currency = currencies.find((x) => x.id === reward.currencyId)!;
        const existingBalance = userInfo?.balances.find((x) => x.currencyId === reward.currencyId);

        // Balance changes
        const randomReward = Math.floor((Math.random() * (reward.maxAmount - reward.minAmount)) + reward.minAmount);
        const totalBalance = (existingBalance?.all ?? 0) + randomReward;

        // Check if any of the rewards went over the maximum balance
        if (currency?.maximumBalance && totalBalance > currency.maximumBalance) {
            const lost = totalBalance - currency.maximumBalance;
            const added = randomReward - lost;

            newBalance.push({
                currency,
                currencyId: reward.currencyId,
                pocket: (existingBalance?.pocket ?? 0) + added,
                bank: existingBalance?.bank ?? 0,
                added,
                lost,
            });
        }
        else newBalance.push({
            currency,
            currencyId: reward.currencyId,
            pocket: (existingBalance?.pocket ?? 0) + randomReward,
            bank: existingBalance?.bank ?? 0,
            added: randomReward,
        });
    }

    await ctx.dbUtil.updateMemberBalance(message.serverId!, message.createdById, userInfo, newBalance);

    const addedCurrencies = newBalance.filter((x) => x.added).map((x) => `${x.added} ${x.currency.name}`);
    const lostCurrencies = newBalance.filter((x) => x.lost).map((x) => `${x.lost} ${x.currency.name}`);

    const actionDescription = (income?.action ?? defaultAction).toLowerCase();

    return (
        lostCurrencies.length
        ? ctx.messageUtil.replyWithWarning(
            message,
                income?.action ?? defaultAction,
                `You have ${actionDescription}, which had ${addedCurrencies.join(", ")}. However, some of the rewards went over the maximum currency limit, so you lost additional ${lostCurrencies.join(", ")}`
            )
            : ctx.messageUtil.replyWithSuccess(message, income?.action ?? defaultAction, `You have ${actionDescription}, which had ${addedCurrencies.join(", ")}.`)
    );
}
