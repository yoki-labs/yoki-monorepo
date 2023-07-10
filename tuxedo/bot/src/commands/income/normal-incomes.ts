import { Currency, DefaultIncomeType, IncomeCommand, MemberBalance, Reward } from "@prisma/client";
import { CommandContext, inlineQuote, ResolvedArgs } from "@yokilabs/bot";
import { Message } from "guilded.js";
import ms from "ms";

import { TuxoClient } from "../../Client";
import { Server } from "../../typings";
import { defaultCreatedCooldown, defaultCreatedReceivedCurrency, defaultIncomes } from "./income-defaults";

type BalanceChange = Pick<MemberBalance, "currencyId" | "pocket" | "bank"> & { currency: Currency; added: number; lost?: number };

export function generateIncomeCommand(incomeType: DefaultIncomeType) {
    const {
        cooldown,
        action,
        reward: [defaultMin, defaultAdditionalMax],
    } = defaultIncomes[incomeType];

    return async function execute(message: Message, _args: Record<string, ResolvedArgs>, ctx: TuxoClient, { server, prefix }: CommandContext<Server>) {
        if (server.disableDefaultIncomes.includes(incomeType))
            return ctx.messageUtil.replyWithError(message, "Command disabled", `This income command has been disabled!\n\nIt can be re-enable by using \`${prefix}income enable ${incomeType}\`.`);

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
        return ctx.messageUtil.replyWithError(message, "Too fast", `You have to wait ${ms(lastUsed + localCooldown - Date.now(), { long: true })} to use ${commandName.toLowerCase()} again.`);

    // For the cooldown
    ctx.balanceUtil.updateLastCommandUsage(message.serverId!, message.createdById, commandName);

    // Add random amounts of rewards that were configured or ones that are default
    const rewards: Pick<Reward, "currencyId" | "minAmount" | "maxAmount">[] = income?.rewards.length
        ? income.rewards
        : [{ currencyId: currencies[0].id, maxAmount: defaultAdditionalMax + defaultMin, minAmount: defaultMin }];

    const userInfo = await ctx.dbUtil.getServerMember(message.serverId!, message.createdById);

    const newBalance: BalanceChange[] = [];

    for (const reward of rewards) {
        // The opposite could be done, but this means adding additional `continue` if reward for that currency
        // doesn't exist, yada yada
        const currency = currencies.find((x) => x.id === reward.currencyId)!;
        const existingBalance = userInfo?.balances.find((x) => x.currencyId === reward.currencyId);

        // Balance changes
        const randomReward = Math.floor(Math.random() * (reward.maxAmount - reward.minAmount) + reward.minAmount);
        const totalBalance = (existingBalance?.all ?? currency.startingBalance ?? 0) + randomReward;

        // Check if any of the rewards went over the maximum balance
        if (currency?.maximumBalance && totalBalance > currency.maximumBalance) {
            const lost = totalBalance - currency.maximumBalance;
            const added = randomReward - lost;

            newBalance.push({
                currency,
                currencyId: reward.currencyId,
                pocket: (existingBalance?.pocket ?? 0) + added,
                bank: existingBalance?.bank ?? currency.startingBalance ?? 0,
                added,
                lost,
            });
        } else
            newBalance.push({
                currency,
                currencyId: reward.currencyId,
                pocket: (existingBalance?.pocket ?? 0) + randomReward,
                bank: existingBalance?.bank ?? currency.startingBalance ?? 0,
                added: randomReward,
            });
    }

    await ctx.dbUtil.updateMemberBalance(message.serverId!, message.createdById, userInfo, newBalance);

    const addedCurrencies = newBalance.filter((x) => x.added).map((x) => `${x.added} ${x.currency.name}`);
    const lostCurrencies = newBalance.filter((x) => x.lost).map((x) => `${x.lost} ${x.currency.name}`);

    const actionDescription = (income?.action ?? defaultAction).toLowerCase();

    return lostCurrencies.length
        ? ctx.messageUtil.replyWithWarning(
              message,
              income?.action ?? defaultAction,
              `You have ${actionDescription}, which gave you ${addedCurrencies.join(
                  ", "
              )}. However, some of the rewards went over the maximum currency limit, so you lost additional ${lostCurrencies.join(", ")}`
          )
        : ctx.messageUtil.replyWithSuccess(message, income?.action ?? defaultAction, `You have ${actionDescription}, which had ${addedCurrencies.join(", ")}.`);
}
