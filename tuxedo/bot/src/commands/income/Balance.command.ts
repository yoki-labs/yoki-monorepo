import { inlineCode } from "@yokilabs/bot";
import { Member } from "guilded.js";

import { Category, Command } from "../commands";
import { Currency, MemberBalance } from "@prisma/client";

const Balance: Command = {
    name: "balance",
    description: "View economical information about a user or yourself.",
    examples: ["0mqNyllA"],
    aliases: ["money", "bal", "m"],
    category: Category.Income,
    args: [
        {
            name: "target",
            display: "user",
            type: "member",
            optional: true,
        },
    ],
    execute: async (message, args, ctx) => {
        const target = (args.target as Member) ?? (await message.client.members.fetch(message.serverId!, message.authorId));

        const currencies = await ctx.dbUtil.getCurrencies(message.serverId!);
        const userInfo = await ctx.dbUtil.getServerMember(message.serverId!, target.id);

        // Map currencies to user's balances to not need to get balance every time
        const currencyBalanceMap =
            currencies
            .map((currency) => [
                currency,
                userInfo?.balances.find((y) => y.currencyId === currency.id)
            ]) as Array<[Currency, MemberBalance]>;

        const pocketLines =
            currencyBalanceMap
            .filter(([_, balance]) =>
                balance?.pocket
            ).map(([currency, balance]) =>
                `${balance?.pocket ?? currency.startingBalance} ${currency.name}`
            );

        // balance?.bank || currency.startingBalance is because startingBalance is added to the bank specifically
        const bankLines =
            currencyBalanceMap
            .filter(([currency, balance]) =>
                balance?.bank || currency.startingBalance
            ).map(([currency, balance]) =>
                `${balance?.bank ?? currency.startingBalance} ${currency.name}`
            );

        return ctx.messageUtil.replyWithInfo(
            message,
            `${target.isOwner ? ":crown: " : ""}<@${target.user!.id}> (${inlineCode(target.user!.id)})`,
            `Info about user's server balance/finances.`,
            {
                thumbnail: target.user?.avatar ? { url: target.user?.avatar } : undefined,
                fields: [
                    {
                        name: "Pocket Balance",
                        value: pocketLines?.length ? pocketLines.join("\n") : "User has no server currency in their wallet.",
                    },
                    {
                        name: "Bank Balance",
                        value: bankLines?.length ? bankLines.join("\n") : "User has no server currency in their bank.",
                    },
                ],
            },
            {
                isSilent: true,
            }
        );
    },
};

export default Balance;
