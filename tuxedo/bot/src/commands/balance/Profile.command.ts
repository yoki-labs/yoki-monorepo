import { Currency, MemberBalance } from "@prisma/client";
import { inlineCode } from "@yokilabs/bot";
import { Member } from "guilded.js";

import { Category, Command } from "../commands";

const PROFILE_ITEMS_PER_PAGE = 10;

const Profile: Command = {
    name: "profile",
    description: "View information in Tuxo about a user or yourself.",
    examples: ["0mqNyllA"],
    aliases: ["money", "bal", "inventory", "inv", "pr"],
    category: Category.Balance,
    args: [
        {
            name: "target",
            display: "user",
            type: "member",
            optional: true,
        },
        {
            name: "page",
            type: "number",
            optional: true,
        }
    ],
    execute: async (message, args, ctx) => {
        const target = (args.target as Member) ?? (await message.client.members.fetch(message.serverId!, message.authorId));
        const page = args.page as number | undefined ?? 1;

        const currencies = await ctx.dbUtil.getCurrencies(message.serverId!);
        const items = await ctx.dbUtil.getItems(message.serverId!);
        const userInfo = await ctx.dbUtil.getServerMember(message.serverId!, target.id);

        // Map currencies to user's balances to not need to get balance every time
        const currencyBalanceMap = currencies.map((currency) => [currency, userInfo?.balances.find((y) => y.currencyId === currency.id)]) as Array<[Currency, MemberBalance]>;

        const pocketLines = currencyBalanceMap
            .filter(([_, balance]) => balance?.pocket)
            .map(([currency, balance]) => `:${currency.emote}: ${balance?.pocket ?? currency.startingBalance} ${currency.name}`);

        // balance?.bank || currency.startingBalance is because startingBalance is added to the bank specifically
        const bankLines = currencyBalanceMap
            .filter(([currency, balance]) => balance?.bank || currency.startingBalance)
            .map(([currency, balance]) => `:${currency.emote}: ${balance?.bank ?? currency.startingBalance} ${currency.name}`);

        return ctx.messageUtil.replyWithInfo(
            message,
            `${target.isOwner ? ":crown: " : ""}<@${target.user!.id}> (${inlineCode(target.user!.id)})`,
            `Information about <@${target.user!.id}>'s balance and inventory.`,
            {
                thumbnail: target.user?.avatar ? { url: target.user?.avatar } : undefined,
                fields: [
                    {
                        name: "Pocket Balance",
                        value: pocketLines?.length ? pocketLines.join("\n") : "User has no server currency in their wallet.",
                        inline: true,
                    },
                    {
                        name: "Bank Balance",
                        value: bankLines?.length ? bankLines.join("\n") : "User has no server currency in their bank.",
                        inline: true,
                    },
                    {
                        name: "Inventory",
                        value: userInfo?.items.length
                            ? ctx.messageUtil.createPaginatedText(page - 1, userInfo.items, PROFILE_ITEMS_PER_PAGE, (itemStack) => `\u2022 ${itemStack.amount} ${items.find((item) => item.id === itemStack.itemId)!.name}`)
                            : "User does not have any items.",
                    },
                ],
                footer: userInfo?.items.length
                    ? {
                        text: `Page ${page}/${Math.ceil(userInfo.items.length / PROFILE_ITEMS_PER_PAGE)} \u2022 total items`
                    }
                    : undefined,
            },
            {
                isSilent: true,
            }
        );
    },
};

export default Profile;
