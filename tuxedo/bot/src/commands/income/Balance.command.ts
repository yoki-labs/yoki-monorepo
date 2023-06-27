import { inlineCode } from "@yokilabs/bot";
import { Member } from "guilded.js";

import { Category, Command } from "../commands";

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

        const currencyLines = userInfo ? userInfo.balances.filter((x) => x.pocket !== 0).map((x) => `${x.pocket} ${currencies.find((y) => y.id === x.currencyId)?.name}`) : null;

        const bankCurrencyLines = userInfo ? userInfo.balances.filter((x) => x.bank !== 0).map((x) => `${x.bank} ${currencies.find((y) => y.id === x.currencyId)?.name}`) : null;

        return ctx.messageUtil.replyWithInfo(
            message,
            `${target.isOwner ? ":crown: " : ""}<@${target.user!.id}> (${inlineCode(target.user!.id)})`,
            `Info about user's server balance/finances.`,
            {
                thumbnail: target.user?.avatar ? { url: target.user?.avatar } : undefined,
                fields: [
                    {
                        name: "Wallet Balance",
                        value: currencyLines?.length ? currencyLines.join("\n") : "User has no server currency in their wallet.",
                    },
                    {
                        name: "Bank Balance",
                        value: bankCurrencyLines?.length ? bankCurrencyLines.join("\n") : "User has no server currency in their bank.",
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
