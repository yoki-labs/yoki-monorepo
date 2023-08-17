import { Currency, MemberBalance, RoleType } from "@prisma/client";
import { inlineCode, inlineQuote } from "@yokilabs/bot";

import { Category, Command } from "../commands";
import { displayCurrencyAmount } from "../../util/text";

type BalanceChange = Pick<MemberBalance, "currencyId" | "bank" | "pocket"> & { currency: Currency, lost: number };

const Sell: Command = {
    name: "shop-sell",
    description: "Sells an item from the inventory.",
    subName: "sell",
    subCommand: true,
    category: Category.Economy,
    requiredRole: RoleType.ADMIN,
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
    execute: async (message, args, ctx, { prefix }) => {
        const number = args.number as number;
        const itemAmount = (args.amount as number | undefined) ?? 1;

        // We just use number - 1 as the index of the item
        if (number < 1)
            return ctx.messageUtil.replyWithError(message, "Invalid number", `The first item in the store always starts with 1.`);
        // It would be selling basically, which is done through ?shop sell
        else if (itemAmount === 0)
            return ctx.messageUtil.replyWithError(message, "Zero is not valid", `You cannot buy 0 amount of items, as it means you aren't doing anything.`);
        else if (itemAmount < 0)
            return ctx.messageUtil.replyWithWarning(message, "Cannot buy negative amount", `If you want to sell an item, type ${inlineCode(`${prefix}shop sell ${number} ${-itemAmount}`)}`);

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
        if (!items.length)
            return ctx.messageUtil.replyWithError(message, "No items", `The store does not have any items at the moment.`);
        else if (number > items.length)
            return ctx.messageUtil.replyWithError(message, "Doesn't exist", `Item with number ${inlineCode(number)} does not exist. The last item in the list has number ${items.length}.`);

        const item = items[number - 1];

        const currencies = await ctx.dbUtil.getCurrencies(message.serverId!);

        const member = await ctx.dbUtil.getServerMember(message.serverId!, message.createdById);

        // Require to have that amount of items
        const memberItemCount = member?.items.find((x) => x.itemId === item.id)?.amount ?? 0;

        // Can't sell amount of something you don't have
        if (memberItemCount < itemAmount)
            return ctx.messageUtil.replyWithError(message, "Not enough items", `You don't have ${itemAmount} of ${inlineQuote(item.name)}.`);

        // We are adding onto the balances
        const balances: BalanceChange[] = [];

        for (const itemValue of item.value) {
            const currency = currencies.find((x) => x.id === itemValue.currencyId)!;
            const memberBalance = member?.balances.find((x) => x.currencyId === itemValue.currencyId);
            const amountInMember = memberBalance?.all ?? currency.startingBalance ?? 0;

            const addedAmount = itemValue.amount * itemAmount;
            // To cap amount to maximum currency balance
            const amountAfter = amountInMember + addedAmount;
            const finalAmount =
                currency.maximumBalance && amountAfter > currency.maximumBalance
                // ? addedAmount - ((amountInMember + addedAmount) - currency.maximumBalance)
                ? addedAmount + currency.maximumBalance - amountAfter
                : addedAmount;

            balances.push({
                currency,
                currencyId: currency.id,
                pocket: memberBalance?.pocket ?? 0,
                bank: (memberBalance?.bank ?? currency.startingBalance ?? 0) + finalAmount,
                lost: addedAmount - finalAmount,
            });
        }

        const existingItem = member?.items.find((x) => x.itemId === item.id);

        await ctx.dbUtil.updateServerMember(
            message.serverId!,
            message.createdById,
            member,
            balances,
            {
                itemId: item.id,
                amount: (existingItem?.amount ?? 0) - itemAmount,
            }
        );

        // Notify user that they lost some of it
        const lostCurrencyAmounts = balances.filter((x) => x.lost);
        if (lostCurrencyAmounts.length)
            return ctx.messageUtil.replyWithWarning(message, "Item sold", `You have successfully sold ${itemAmount} ${item.name}, but the received currency was exceeded by ${lostCurrencyAmounts.map((x) => displayCurrencyAmount(x.currency, x.lost)).join(", ")}.`)

        return ctx.messageUtil.replyWithSuccess(
            message,
            `Item sold`,
            `You have successfully sold ${itemAmount} ${item.name}.`,
        );
    },
};

export default Sell;
