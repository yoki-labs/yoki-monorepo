import { inlineCode, inlineQuote } from "@yokilabs/bot";
import ms from "ms";

import { Category, Command } from "../commands";

const depositCooldown = 5 * 60 * 60 * 1000;

const Daily: Command = {
    name: "deposit",
    description: "Deposits money to the bank.",
    aliases: ["dep", "dp"],
    category: Category.Income,
    args: [
        {
            name: "tag",
            display: "currency tag | all",
            type: "string",
        },
        {
            name: "amount",
            type: "number",
            optional: true,
        },
    ],
    execute: async (message, args, ctx) => {
        const amount = args.amount ? Math.floor(args.amount as number) : null;
        const tag = (args.tag as string).toLowerCase();

        if (amount && amount < 1) return ctx.messageUtil.replyWithError(message, "Amount must be more than 0", `The deposit amount must be equal to or greater than 1.`);

        // To make robbery in the future more balanced (yes, the pun), add cooldowns to the depositing
        const lastUsed = ctx.balanceUtil.getLastCommandUsage(message.serverId!, message.createdById, "deposit");

        // Need to wait 5 hours
        if (lastUsed && Date.now() - lastUsed < depositCooldown)
            return ctx.messageUtil.replyWithError(
                message,
                "Too fast",
                `You have to wait ${ms(lastUsed + depositCooldown - Date.now(), { long: true })} to deposit your currency again.`
            );

        // Check existance and balance of members
        const member = await ctx.dbUtil.getServerMember(message.serverId!, message.createdById);

        if (!member?.balances.length) return ctx.messageUtil.replyWithError(message, "No balance", `You do not have any currency in your balance to deposit anything.`);

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
            // Check if it can be deposited
            if (amount && depositingBalance.pocket < amount) {
                // Get the currency to display its name in the error
                const depositingCurrency = serverCurrencies.find((x) => x.id === depositingBalance.currencyId)!;

                return ctx.messageUtil.replyWithError(
                    message,
                    "Balance currency too low",
                    `You cannot deposit ${inlineCode(amount)} ${depositingCurrency.name}, as your balance only has ${depositingBalance.pocket} ${
                        depositingCurrency.name
                    }.`
                );
            }

            // If the amount was not specified, deposit all of what is in the pocket
            depositMap[depositingBalance.id] = amount ?? depositingBalance.pocket;
        }

        // Deposit into bank
        await ctx.dbUtil.updateServerMemberBankBalance(member, depositMap);

        // Reply with success
        return ctx.messageUtil.replyWithSuccess(message, `Balance deposited`, `You have successfully deposited ${depositingCurrencies.map((x) => `${depositMap[x.id]} ${x.name}`)}.`);
    },
};

export default Daily;
