import { MemberBalance, ModuleName, RoleType } from "@prisma/client";
import { inlineCode } from "@yokilabs/bot";

import { displayCurrency } from "../../util/text";
import { Category, Command } from "../commands";

const Buy: Command = {
    name: "shop-buy",
    description: "Buys an item from the store.",
    subName: "buy",
    subCommand: true,
    category: Category.Economy,
    args: [
        {
            name: "number",
            display: "item's number in the store",
            type: "number",
        },
        {
            name: "amount",
            type: "number",
            optional: true,
        },
    ],
    execute: async (message, args, ctx, { server, prefix }) => {
        // Allow one kill switch to shut all of it down if necessary without any additional hassle
        if (server.modulesDisabled.includes(ModuleName.SHOP))
            return ctx.messageUtil.replyWithError(message, "Shop module disabled", `Shop module has been disabled and this command cannot be used.`);

        const number = args.number as number;
        const itemAmount = (args.amount as number | undefined) ?? 1;

        // We just use number - 1 as the index of the item
        if (number < 1) return ctx.messageUtil.replyWithError(message, "Invalid number", `The first item in the store always starts with 1.`);
        // It would be selling basically, which is done through ?shop sell
        else if (itemAmount === 0) return ctx.messageUtil.replyWithError(message, "Zero is not valid", `You cannot buy 0 amount of items, as it means you aren't doing anything.`);
        else if (itemAmount < 0)
            return ctx.messageUtil.replyWithWarning(
                message,
                "Cannot buy negative amount",
                `If you want to sell an item, type ${inlineCode(`${prefix}shop sell ${number} ${-itemAmount}`)}`
            );

        const items = await ctx.prisma.item.findMany({
            where: {
                serverId: message.serverId!,
                canBuy: true,
            },
            include: {
                value: true,
            },
        });

        // Item needs to exist for it to be bought
        if (!items.length) return ctx.messageUtil.replyWithError(message, "No items", `The store does not have any items at the moment.`);
        else if (number > items.length)
            return ctx.messageUtil.replyWithError(
                message,
                "Doesn't exist",
                `Item with number ${inlineCode(number)} does not exist. The last item in the list has number ${items.length}.`
            );

        const item = items[number - 1];

        const currencies = await ctx.dbUtil.getCurrencies(message.serverId!);

        const member = await ctx.dbUtil.getServerMember(message.serverId!, message.createdById);

        // Check if user has any of it
        const balances: Pick<MemberBalance, "currencyId" | "bank" | "pocket">[] = [];

        for (const itemValue of item.value) {
            const currency = currencies.find((x) => x.id === itemValue.currencyId)!;
            const memberBalance = member?.balances.find((x) => x.currencyId === itemValue.currencyId);
            const amountInMember = memberBalance?.all ?? currency.startingBalance ?? 0;

            const requiredAmount = itemValue.amount * itemAmount;

            // User doesn't have enough currency to buy this item
            if (amountInMember < requiredAmount)
                return ctx.messageUtil.replyWithError(
                    message,
                    "Need more currency",
                    `You need ${itemValue.amount * itemAmount} more ${displayCurrency(currency)} to buy this item.`
                );

            balances.push({
                currencyId: currency.id,
                pocket: memberBalance?.pocket ?? 0,
                bank: (memberBalance?.bank ?? currency.startingBalance ?? 0) - requiredAmount,
            });
        }

        const existingItem = member?.items.find((x) => x.itemId === item.id);
        const newCount = (existingItem?.amount ?? 0) + itemAmount;

        await Promise.all([
            // TODO: Too many roles to give
            // ...(!existingItem?.amount && item.givesRoles.length ? item.givesRoles.map((x) =>
            //     ctx.roles.addRoleToMember(message.serverId!, message.createdById, x)
            // ) : [])
            !existingItem?.amount && item.givesRoles.length && ctx.roles.addRoleToMember(message.serverId!, message.createdById, item.givesRoles[0]),
            ctx.dbUtil.updateServerMember(message.serverId!, message.createdById, member, balances, {
                itemId: item.id,
                amount: newCount,
            }),
        ]);

        return ctx.messageUtil.replyWithSuccess(message, `Item bought`, `You have successfully purchased ${itemAmount} ${item.name}.`);
    },
};

export default Buy;
