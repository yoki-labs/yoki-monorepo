import { ModuleName, RoleType } from "@prisma/client";
import { inlineCode, inlineQuote } from "@yokilabs/bot";

import { Category, Command } from "../commands";
import { displayItemValues } from "../items/item-values";

const Info: Command = {
    name: "shop-info",
    description: "Provides information about item in the store.",
    subName: "info",
    subCommand: true,
    category: Category.Economy,
    requiredRole: RoleType.ADMIN,
    args: [
        {
            name: "number",
            display: "item's number in the store",
            type: "string",
        },
    ],
    execute: async (message, args, ctx, { server, prefix }) => {
        // Allow one kill switch to shut all of it down if necessary without any additional hassle
        if (server.modulesDisabled.includes(ModuleName.SHOP))
            return ctx.messageUtil.replyWithError(message, "Shop module disabled", `Shop module has been disabled and this command cannot be used.`);

        const number = args.number as number;

        // We just use number - 1 as the index of the item
        if (number < 1)
            return ctx.messageUtil.replyWithError(message, "Invalid number", `The first item in the store always starts with 1.`);

        const items = await ctx.prisma.item.findMany({
            where: {
                serverId: message.serverId!,
                canBuy: true,
            },
            include: {
                value: true,
            },
        });

        // Item needs to exist for it to be deleted
        if (!items.length)
            return ctx.messageUtil.replyWithError(message, "No items", `The store does not have any items at the moment.`);
        else if (number > items.length)
            return ctx.messageUtil.replyWithError(message, "Doesn't exist", `Item with number ${inlineCode(number)} does not exist. The last item in the list has number ${items.length}.`);

        const item = items[number - 1];
        const currencies = await ctx.dbUtil.getCurrencies(message.serverId!);

        return ctx.messageUtil.replyWithInfo(
            message,
            `${number}. ${item.name}`,
            `${inlineQuote(item.name)} is an item that is available for purchase.`,
            {
                fields: [
                    {
                        name: "Price",
                        value: item.value.length ? displayItemValues(item.value, currencies) : "This item is free.",
                    },
                ],
                footer: {
                    text: `You can buy this item by typing ${inlineCode(`${prefix}shop buy ${number}`)}`
                }
            },
            {
                isSilent: true,
            }
        );
    },
};

export default Info;
