import ms from "ms";
import { Category, Command } from "../commands";
import { inlineCode, inlineQuote } from "@yokilabs/bot";

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
            type: "string"
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

        if (amount && amount < 1)
            return ctx.messageUtil.replyWithError(message, "Amount must be more than 0", `The deposit amount must be equal to or greater than 1.`);

        // To make robbery in the future more balanced (yes, the pun), add cooldowns to the depositing
        const lastUsed = ctx.balanceUtil.getLastCommandUsage(message.serverId!, message.createdById, "deposit");

        // Need to wait 5 hours
        if (lastUsed && (Date.now() - lastUsed) < depositCooldown)
            return ctx.messageUtil.replyWithError(message, "Too fast", `You have to wait ${ms(lastUsed + depositCooldown - Date.now(), { long: true })} to deposit your currency again.`);

        const serverCurrencies = await ctx.dbUtil.getCurrencies(message.serverId!);
        const depositingCurrencies = tag === "all" ? serverCurrencies : serverCurrencies.filter(x => x.tag === tag);

        // If there is no such currency and they are not depositing all currency, then error out
        if (tag !== "all" && !depositingCurrencies.length)
            return ctx.messageUtil.replyWithError(message, "No such currency", `There is no currency with tag ${inlineQuote(tag)} in this server.`);

        // Check existance and balance of members
        const member = await ctx.dbUtil.getServerMember(message.serverId!, message.createdById);

        if (!member?.balance)
            return ctx.messageUtil.replyWithError(message, "No balance", `You do not have any currency in your balance to deposit anything.`);

        const deposit = {};

        // Fill in the deposit
        for (const depositingCurrency of depositingCurrencies) {
            // Check if it can be deposited
            if (amount && member.balance[depositingCurrency.id] < amount)
                return ctx.messageUtil.replyWithError(message, "Balance currency too low", `You cannot deposit ${inlineCode(amount)} ${depositingCurrency.name}, as your balance only has ${member.balance[depositingCurrency.id]} ${depositingCurrency.name}.`);

            deposit[depositingCurrency.id] = amount ?? member.balance[depositingCurrency.id];
        }

        // Deposit into bank
        await ctx.dbUtil.updateServerMemberBankBalance(member, deposit, serverCurrencies);

        // Reply with success
        return ctx.messageUtil.replyWithSuccess(message, `Balance deposited`, `You have successfully deposited all/some of your balance.`);
    },
};

export default Daily;
