import { Currency, DefaultIncomeType, IncomeCommand, MemberBalance, ModuleName, Reward, ServerMember } from "@prisma/client";
import { checkmarkEmoteNode, CommandContext, createTextElement, exclamationmarkEmoteNode, inlineQuote, ResolvedArgs } from "@yokilabs/bot";
import { RichMarkupInlineElement, RichMarkupText } from "@yokilabs/bot/dist/src/utils/rich-types";
import { Message } from "guilded.js";
import ms from "ms";

import { TuxoClient } from "../../Client";
import { Server } from "../../typings";
import { displayCurrencyAmountRichMarkup } from "../../util/text";
import { defaultCreatedCooldown, defaultCreatedReceivedCurrency, defaultIncomes } from "./income-defaults";

type BalanceChange = Pick<MemberBalance, "currencyId" | "pocket" | "bank"> & { currency: Currency; added: number; lost?: number };
type FailedBalanceChange = Pick<MemberBalance, "currencyId" | "pocket" | "bank"> & { currency: Currency; change: number };

export function generateIncomeCommand(incomeType: DefaultIncomeType) {
    const {
        cooldown,
        action,
        reward: [defaultMin, defaultAdditionalMax],
    } = defaultIncomes[incomeType];

    return async function execute(message: Message, _args: Record<string, ResolvedArgs>, ctx: TuxoClient, { server, prefix }: CommandContext<Server>) {
        // Allow one kill switch to shut all of it down if necessary without any additional hassle
        if (server.modulesDisabled.includes(ModuleName.ECONOMY))
            return ctx.messageUtil.replyWithError(message, "Economy module disabled", `Economy module has been disabled and this command cannot be used.`);

        if (server.disableDefaultIncomes.includes(incomeType))
            return ctx.messageUtil.replyWithError(
                message,
                "Command disabled",
                `This income command has been disabled!\n\nIt can be re-enable by using \`${prefix}income enable ${incomeType}\`.`
            );

        const currencies = await ctx.dbUtil.getCurrencies(message.serverId!);

        if (!currencies.length) return ctx.messageUtil.replyWithError(message, "No currencies", `This server does not have any local currencies ${action}.`);

        const serverConfig = (await ctx.dbUtil.getIncomeOverrides(message.serverId!)).find((x) => x.incomeType === incomeType);

        return useIncomeCommand(incomeType, action, cooldown, defaultAdditionalMax, defaultMin, serverConfig, currencies, ctx, message);
    };
}

export async function useCustomIncomeCommand(ctx: TuxoClient, message: Message, server: Server, income: IncomeCommand & { rewards: Reward[] }) {
    // Allow one kill switch to shut all of it down if necessary without any additional hassle
    if (server.modulesDisabled.includes(ModuleName.ECONOMY))
        return ctx.messageUtil.replyWithError(message, "Economy module disabled", `Economy module has been disabled and this command cannot be used.`);

    const currencies = await ctx.dbUtil.getCurrencies(message.serverId!);

    if (!currencies.length)
        return ctx.messageUtil.replyWithError(message, "No currencies", `This server does not have any local currencies to use ${inlineQuote(income.name)} income command.`);

    return useIncomeCommand(
        income.name!,
        [`You have used ${income.name}, which gave you {}.`],
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
    defaultAction: string[],
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
        return ctx.messageUtil.replyWithError(
            message,
            "Too fast",
            `You have to wait ${ms(lastUsed + localCooldown - Date.now(), { long: true })} to use ${commandName.toLowerCase()} again.`
        );

    // For the cooldown
    ctx.balanceUtil.updateLastCommandUsage(message.serverId!, message.createdById, commandName);

    // Add random amounts of rewards that were configured or ones that are default
    const rewards: Pick<Reward, "currencyId" | "minAmount" | "maxAmount">[] = income?.rewards.length
        ? income.rewards
        : [{ currencyId: currencies[0].id, maxAmount: defaultAdditionalMax + defaultMin, minAmount: defaultMin }];

    const userInfo = await ctx.dbUtil.getServerMember(message.serverId!, message.createdById);

    // Since it can fail too; the loop below is a little different and does additional calculations
    // that are unnecessary
    if (income?.failChance && income.failChance > Math.random()) return onIncomeFail(commandName, income!, rewards, userInfo, currencies, ctx, message);

    return onIncomeSuccess(income, defaultAction, rewards, userInfo, currencies, ctx, message);
}

async function onIncomeSuccess(
    income: (IncomeCommand & { rewards: Reward[] }) | undefined,
    defaultAction: string[],
    rewards: Pick<Reward, "currencyId" | "minAmount" | "maxAmount">[],
    userInfo: (ServerMember & { balances: MemberBalance[] }) | undefined,
    currencies: Currency[],
    ctx: TuxoClient,
    message: Message
) {
    const newBalance: BalanceChange[] = [];

    for (const reward of rewards) {
        // The opposite could be done, but this means adding additional `continue` if reward for that currency
        // doesn't exist, yada yada
        const currency = currencies.find((x) => x.id === reward.currencyId)!;
        const existingBalance = userInfo?.balances.find((x) => x.currencyId === reward.currencyId);
        const existingBalanceCount = existingBalance?.all ?? currency.startingBalance ?? 0;

        // Balance changes
        const randomReward = Math.floor(Math.random() * (reward.maxAmount - reward.minAmount) + reward.minAmount);
        const totalBalance = existingBalanceCount + randomReward;

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

    const addedCurrencies = newBalance.filter((x) => x.added);
    const lostCurrencies = newBalance.filter((x) => x.lost);

    // There can be multiple action messages
    const actionDescriptionTemplates = income?.action?.split("|") ?? defaultAction;
    const randomActionTemplate = actionDescriptionTemplates[Math.floor(Math.random() * actionDescriptionTemplates.length)];

    // Template the action message
    // const addedCurrenciesList = addedCurrencies.join(", ");
    const actionDescription = randomActionTemplate.split("{}", 2);

    return ctx.messageUtil.replyWithRichMessage(message, [
        {
            object: "block",
            type: "paragraph",
            data: {},
            nodes: [
                // Icon of the content; if it went over the limit, use exclamation mark
                lostCurrencies.length ? exclamationmarkEmoteNode : checkmarkEmoteNode,
                // It might start with currency rewards
                actionDescription[0] && createTextElement(` ${actionDescription[0]}`),
                // It might look rather empty if everything went over the limit
                ...(addedCurrencies.length
                    ? addedCurrencies.flatMap((x, i) => displayCurrencyAmountRichMarkup(x.currency, x.added, i < addedCurrencies.length - 1))
                    : [createTextElement(`some rewards`)]),
                // If there is any text after the reward, add the text afterwards
                // There may be some currency that went over the limit, so add the `However, ...` text too
                (actionDescription[1] || lostCurrencies.length) &&
                    createTextElement(
                        lostCurrencies.length ? `${actionDescription[1]} However, some of the rewards went over the limit, so you lost additional ` : actionDescription[1]
                    ),
                // Add some lost currencies that went over the limit if there were any
                ...(lostCurrencies.length ? lostCurrencies.flatMap((x, i) => displayCurrencyAmountRichMarkup(x.currency, x.lost!, i < lostCurrencies.length - 1)) : []),
            ].filter(Boolean) as (RichMarkupText | RichMarkupInlineElement)[],
        },
    ]);
}

async function onIncomeFail(
    commandName: string,
    income: IncomeCommand & { rewards: Reward[] },
    rewards: Pick<Reward, "currencyId" | "minAmount" | "maxAmount">[],
    userInfo: (ServerMember & { balances: MemberBalance[] }) | undefined,
    currencies: Currency[],
    ctx: TuxoClient,
    message: Message
) {
    const newBalance: FailedBalanceChange[] = [];

    const failCut = income.failSubtractCut ?? 0;

    // There is no point in doing anything, nor displaying the fail chance
    if (!failCut) return ctx.messageUtil.replyWithWarning(message, `${commandName} failed`, `You failed while doing ${commandName}.`);

    // Loop for checking whether executor has enough balance and adding rewards; does it all
    for (const reward of rewards) {
        // The opposite could be done, but this means adding additional `continue` if reward for that currency
        // doesn't exist, yada yada
        const currency = currencies.find((x) => x.id === reward.currencyId)!;
        const existingBalance = userInfo?.balances.find((x) => x.currencyId === reward.currencyId);

        const randomReward = Math.floor(Math.random() * (reward.maxAmount - reward.minAmount) + reward.minAmount);
        const lostWithCut = Math.floor(randomReward * failCut);

        newBalance.push({
            currencyId: reward.currencyId,
            pocket: existingBalance?.pocket ?? 0,
            bank: (existingBalance?.bank ?? currency.startingBalance ?? 0) - lostWithCut,
            currency,
            change: lostWithCut,
        });
    }

    await ctx.dbUtil.updateMemberBalance(message.serverId!, message.createdById, userInfo, newBalance);

    return ctx.messageUtil.replyWithRichMessage(message, [
        {
            object: "block",
            type: "paragraph",
            data: {},
            nodes: [
                exclamationmarkEmoteNode,
                createTextElement(` You have failed while doing ${commandName.toLowerCase()} and lost `),
                // It might look rather empty if everything went over the limit
                ...newBalance.flatMap((x, i) => displayCurrencyAmountRichMarkup(x.currency, x.change, i < newBalance.length - 1)),
            ],
        },
    ]);
}
