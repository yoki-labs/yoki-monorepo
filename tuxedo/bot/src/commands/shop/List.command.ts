import { Currency, ItemValue, ModuleName, RoleType } from "@prisma/client";
import { inlineQuote } from "@yokilabs/bot";

import { Category, Command } from "../commands";

const List: Command = {
    name: "shop-list",
    description: "Lists all server's items.",
    subName: "list",
    subCommand: true,
    category: Category.Economy,
    args: [
        {
            name: "page",
            type: "number",
            optional: true,
        },
    ],
    execute: async (message, args, ctx, { server }) => {
        // Allow one kill switch to shut all of it down if necessary without any additional hassle
        if (server.modulesDisabled.includes(ModuleName.SHOP))
            return ctx.messageUtil.replyWithError(message, "Shop module disabled", `Shop module has been disabled and this command cannot be used.`);

        const page = ((args.page as number | undefined) ?? 1) - 1;

        const items = await ctx.prisma.item.findMany({
            where: {
                serverId: message.serverId!,
                canBuy: true,
            },
            include: {
                value: true,
            },
        });

        // Don't need to fetch server currencies and all that nonsense
        if (!items.length) return ctx.messageUtil.replyWithNullState(message, "Nothing found", `There are no items in the store as of now.`);

        const currencies = await ctx.dbUtil.getCurrencies(message.serverId!);

        const start = page * 10 + 1;

        console.log("Item count", items.length, "of server", JSON.stringify(message.serverId));

        return ctx.messageUtil.replyWithPaginatedContent({
            replyTo: message,
            title: "Store items",
            items,
            itemsPerPage: 10,
            page,
            itemMapping: (x, i) => `${start + i}. ${inlineQuote(x.name)} \u2014 ${displayPrice(x.value, currencies)}`,
        });
    },
};

const displayPrice = (itemValues: ItemValue[], currencies: Currency[]) =>
    itemValues.length
        ? `${displayCurrencyAmount(itemValues[0].amount, currencies.find((x) => itemValues[0].currencyId === x.id)!)}${itemValues.length > 1 ? ` and other` : ""}`
        : `Free`;

const displayCurrencyAmount = (amount: number, currency: Currency) => `:${currency.emote}: ${amount} ${currency.name}`;

export default List;
