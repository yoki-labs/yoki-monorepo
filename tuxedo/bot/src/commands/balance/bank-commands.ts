import { Currency, MemberBalance, ModuleName, ServerMember } from "@prisma/client";
import { inlineCode, ResolvedArgs } from "@yokilabs/bot";
import { Message } from "guilded.js";
import ms from "ms";

import { TuxoClient } from "../../Client";
import { CommandContext } from "../../typings";
import { displayCurrencyAmountInline } from "../../util/text";
import { bankCooldown } from "../income/income-defaults";

export function generateBankCommand(
    balanceType: string,
    action: string,
    actionDone: string,
    depositMultiplier: number,
    getBalanceAmount: (balance: MemberBalance | undefined, startingBalance: number | null) => number
) {
    return async (message: Message, args: Record<string, ResolvedArgs>, ctx: TuxoClient, { server }: CommandContext) => {
        if (server.modulesDisabled.includes(ModuleName.ECONOMY))
            return ctx.messageUtil.replyWithError(message, "Economy module disabled", `Economy module has been disabled and this command cannot be used.`);

        const amount = args.amount ? Math.floor(args.amount as number) : null;
        const tag = (args.tag as string).toLowerCase();

        if (amount && amount < 1) return ctx.messageUtil.replyWithError(message, "Amount must be more than 0", `The ${action} amount must be equal to or greater than 1.`);

        // To make robbery in the future more balanced (yes, the pun), add cooldowns to the depositing
        const lastUsed = ctx.balanceUtil.getLastCommandUsage(message.serverId!, message.createdById, "bank");

        // Need to wait 5 hours
        if (lastUsed && Date.now() - lastUsed < bankCooldown)
            return ctx.messageUtil.replyWithError(message, "On cooldown", `You have to wait ${ms(lastUsed + bankCooldown - Date.now(), { long: true })} to use bank again.`);

        // Check existance and balance of members
        const member = await ctx.dbUtil.getServerMember(message.serverId!, message.createdById);

        if (!member?.balances.length)
            return ctx.messageUtil.replyWithError(message, "No balance", `You do not have any currency in your ${balanceType} balance to ${action} anything.`);

        const serverCurrencies = await ctx.dbUtil.getCurrencies(message.serverId!);

        //
        // const depositingCurrencies = tag === "all" ? serverCurrencies.filter((x) => x.bankEnabled) : serverCurrencies.filter((x) => x.tag === tag);

        // If there is no such currency and they are not depositing all currency, then error out
        // As we check if there is at least 1 item in .balances, tag === "all" will never have this as true
        if (tag === "all") {
            const depositingCurrencies = serverCurrencies.filter((x) => x.bankEnabled);

            if (!depositingCurrencies.length)
                return ctx.messageUtil.replyWithError(message, "No currency", `There is no currency that can be deposited to bank in this server.`);

            return depositAllCurrency(ctx, message, member, depositingCurrencies, amount, depositMultiplier, balanceType, action, actionDone, getBalanceAmount);
        }

        const depositingCurrency = serverCurrencies.find((x) => x.tag === tag);

        if (!depositingCurrency) return ctx.messageUtil.replyWithError(message, "No currency", `Currency with the tag ${inlineCode(tag)} does not exist.`);
        // Allow disabling bank for specific currencies
        else if (!depositingCurrency.bankEnabled)
            return ctx.messageUtil.replyWithError(
                message,
                "Cannot deposit or draw",
                `Currency with the tag ${inlineCode(tag)} cannot be deposited to the bank, as bank for this currency has been disabled.`
            );

        return depositOneCurrency(ctx, message, member, depositingCurrency, amount, depositMultiplier, balanceType, action, actionDone, getBalanceAmount);
    };
}

async function depositAllCurrency(
    ctx: TuxoClient,
    message: Message,
    member: ServerMember & { balances: MemberBalance[] },
    depositingCurrencies: Currency[],
    amount: number | null,
    depositMultiplier: number,
    balanceType: string,
    action: string,
    actionDone: string,
    getBalanceAmount: (balance: MemberBalance | undefined, startingBalance: number | null) => number
): Promise<unknown> {
    // The map of currencies and how much to add to the bank
    const depositMap: Record<string, number> = {};

    // Fill in the deposit
    for (const depositingCurrency of depositingCurrencies) {
        const depositingBalance = member.balances.find((x) => x.currencyId === depositingCurrency.id);

        const balanceAmount = getBalanceAmount(depositingBalance, depositingCurrency.startingBalance);

        // Check if it can be deposited
        if (amount && balanceAmount < amount)
            return ctx.messageUtil.replyWithErrorInline(
                message,
                `You cannot ${action} ${inlineCode(amount)} ${depositingCurrency.name}, as your ${balanceType} balance only has ${balanceAmount} ${depositingCurrency.name}.`
            );

        // If the amount was not specified, deposit all of what is in the pocket
        depositMap[depositingCurrency.id] = (amount ?? balanceAmount) * depositMultiplier;
    }

    return depositToBank(ctx, message, member, depositMap, depositMultiplier, actionDone, depositingCurrencies);
}

async function depositOneCurrency(
    ctx: TuxoClient,
    message: Message,
    member: ServerMember & { balances: MemberBalance[] },
    depositingCurrency: Currency,
    amount: number | null,
    depositMultiplier: number,
    balanceType: string,
    action: string,
    actionDone: string,
    getBalanceAmount: (balance: MemberBalance | undefined, startingBalance: number | null) => number
) {
    const depositingBalance = member.balances.find((x) => x.currencyId === depositingCurrency.id);

    // depositMultiplier
    const balanceAmount = getBalanceAmount(depositingBalance, depositingCurrency.startingBalance);

    // Check if it can be deposited
    if (amount && balanceAmount < amount)
        return ctx.messageUtil.replyWithErrorInline(
            message,
            `You cannot ${action} ${inlineCode(amount)} ${depositingCurrency.name}, as your ${balanceType} balance only has ${balanceAmount} ${depositingCurrency.name}.`
        );

    return depositToBank(ctx, message, member, { [depositingCurrency.id]: (amount ?? balanceAmount) * depositMultiplier }, depositMultiplier, actionDone, [depositingCurrency]);
}

async function depositToBank(
    ctx: TuxoClient,
    message: Message,
    member: ServerMember & { balances: MemberBalance[] },
    depositMap: Record<string, number>,
    depositMultiplier: number,
    actionDone: string,
    depositedCurrencies: Currency[]
) {
    ctx.balanceUtil.updateLastCommandUsage(message.serverId!, message.createdById, "bank");

    // Deposit into bank
    await ctx.dbUtil.depositMemberBalance(member, depositMap);

    return ctx.messageUtil.replyWithSuccessInline(message, `You have successfully ${actionDone} ${depositedCurrencies.map((x) => displayCurrencyAmountInline(x, depositMap[x.id] / depositMultiplier))}`);
}
