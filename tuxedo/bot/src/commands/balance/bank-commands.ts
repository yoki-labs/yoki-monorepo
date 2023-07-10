import { MemberBalance } from "@prisma/client";
import { inlineCode, inlineQuote, ResolvedArgs } from "@yokilabs/bot";
import { Message } from "guilded.js";
import ms from "ms";

import { TuxoClient } from "../../Client";
import { CommandContext } from "../../typings";
import { bankCooldown } from "../income/income-defaults";

export function generateBankCommand(balanceType: string, action: string, actionDone: string, depositMultiplier: number, getBalanceAmount: (balance: MemberBalance) => number) {
    return async (message: Message, args: Record<string, ResolvedArgs>, ctx: TuxoClient, _context: CommandContext) => {
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
