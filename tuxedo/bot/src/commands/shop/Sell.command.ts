import { Currency, MemberBalance, ModuleName } from "@prisma/client";
import { inlineCode, inlineQuote } from "@yokilabs/bot";

import { displayCurrencyAmount } from "../../util/text";
import { Category, Command } from "../commands";

type BalanceChange = Pick<MemberBalance, "currencyId" | "bank" | "pocket"> & { currency: Currency; lost: number };

const Sell: Command = {
    name: "shop-sell",
    description: "Sells an item from the inventory.",
    subName: "sell",
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

        // Require to have that amount of items
        const memberItemCount = member?.items.find((x) => x.itemId === item.id)?.amount ?? 0;

        // Can't sell amount of something you don't have
        if (memberItemCount < itemAmount) return ctx.messageUtil.replyWithError(message, "Not enough items", `You don't have ${itemAmount} of ${inlineQuote(item.name)}.`);

        // We are adding onto the balances
        const balances: BalanceChange[] = [];

        for (const itemValue of item.value) {
            const currency = currencies.find((x) => x.id === itemValue.currencyId)!;
            const memberBalance = member?.balances.find((x) => x.currencyId === itemValue.currencyId);
            const amountInMember = memberBalance?.all ? Number(memberBalance.all) : currency.startingBalance ?? 0;

            const addedAmount = itemValue.amount * itemAmount;
            // To cap amount to maximum currency balance
            const amountAfter = amountInMember + addedAmount;
            const finalAmount =
                currency.maximumBalance && amountAfter > currency.maximumBalance
                    ? // The delta between maximum balance and how much member had (This is how much we can add until we get to the max)
                      currency.maximumBalance - amountInMember
                    : addedAmount;

            balances.push({
                currency,
                currencyId: currency.id,
                pocket: memberBalance?.pocket ?? 0,
                bank: (memberBalance?.bank ?? currency.startingBalance ?? 0) + finalAmount,
                // Final amount means how much we added due to cap. If finalAmount === addedAmount, then we lost nothing
                // Otherwise, we lost anything after finalAmount
                lost: addedAmount - finalAmount,
            });
        }

        const existingItem = member?.items.find((x) => x.itemId === item.id);
        const newAmount = (existingItem?.amount ?? 0) - itemAmount;

        await Promise.all([
            ctx.dbUtil.updateServerMember(message.serverId!, message.createdById, member, balances, {
                itemId: item.id,
                amount: newAmount,
            }),
            // They sold all the item stack and no longer has access to the item; role is tied to the item.
            // TODO: As you can't remove multiple roles and if we did do it one by one it would lead to ratelimiting,
            // it only does it for the first role
            newAmount === 0 && item.givesRoles.length && ctx.roles.removeRoleFromMember(message.serverId!, message.createdById, item.givesRoles[0]),
        ]);

        // Notify user that they lost some of it
        const lostCurrencyAmounts = balances.filter((x) => x.lost);
        if (lostCurrencyAmounts.length)
            return ctx.messageUtil.replyWithWarning(
                message,
                "Item sold",
                `You have successfully sold ${itemAmount} ${item.name}, but the received currency was exceeded by ${lostCurrencyAmounts
                    .map((x) => displayCurrencyAmount(x.currency, x.lost))
                    .join(", ")}.`
            );

        return ctx.messageUtil.replyWithSuccess(message, `Item sold`, `You have successfully sold ${itemAmount} ${item.name}.`);
    },
};

export default Sell;
