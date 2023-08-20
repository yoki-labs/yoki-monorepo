import { Currency, Item, ItemValue, RoleType } from "@prisma/client";
import { inlineQuote } from "@yokilabs/bot";
import { Message } from "guilded.js";

import { TuxoClient } from "../../Client";
import { displayCurrency, displayCurrencyAmount } from "../../util/text";
import { Category, Command } from "../commands";
import { displayItemValues } from "./item-values";

type ItemValueChange = Pick<ItemValue, "currencyId" | "serverId" | "amount">;

const SetPrice: Command = {
    name: "items-price",
    description: "Changes the required price of a command.",
    subName: "price",
    subCommand: true,
    category: Category.Economy,
    requiredRole: RoleType.MOD,
    args: [
        {
            name: "id",
            display: "item ID",
            type: "string",
        },
        {
            name: "currency",
            display: "currency tag",
            type: "string",
            optional: true,
        },
        {
            name: "amount",
            display: "required amount",
            type: "number",
            optional: true,
        },
    ],
    execute: async (message, args, ctx) => {
        const itemId = args.id as string;
        const currencyTag = args.currency as string | undefined;
        const amount = args.amount as number | undefined;

        const item = await ctx.dbUtil.getItem(message.serverId!, itemId);

        if (!item) return ctx.messageUtil.replyWithError(message, "No such item", `Item with ID ${inlineQuote(itemId)} does not exist.`);

        const serverCurrencies = await ctx.dbUtil.getCurrencies(message.serverId!);

        if (!currencyTag)
            return ctx.messageUtil.replyWithInfo(
                message,
                `Price for ${inlineQuote(item.name)}`,
                item.value.length ? displayItemValues(item.value, serverCurrencies) : `The item is free.`
            );

        // Rewarded currency
        const currency = serverCurrencies.find((x) => x.tag === currencyTag);

        if (!currency) return ctx.messageUtil.replyWithError(message, "No such currency", `There is no currency with tag ${inlineQuote(currencyTag)} in this server.`);

        // Only currencyTag is truly optional
        if (typeof amount === "undefined")
            return ctx.messageUtil.replyWithError(
                message,
                `Expected price amount`,
                `Please provide required price amount of :${currency.emote}: ${currency.name} for ${item.name}.`
            );

        // There is no reason to have it stay if it's 0, it's useless
        if (amount === 0) return removeItemValue(ctx, message, currency, serverCurrencies, item);

        const currentItemValue = item.value.find((x) => x.currencyId === currency.id);

        // No point in changing it if it's already the desired price
        if (currentItemValue?.amount === amount)
            return ctx.messageUtil.replyWithError(
                message,
                "Already set",
                `The price for the item ${inlineQuote(item.name)} already includes ${displayCurrencyAmount(currency, amount)}.`
            );

        // Can't create it, so it has to be updated
        const newCurrencyAmount: ItemValueChange = {
            serverId: message.serverId!,
            currencyId: currency.id,
            amount,
        };

        await ctx.dbUtil.updateItemValue(item, newCurrencyAmount);

        const changedIndex = item.value.findIndex((x) => x.currencyId === currency.id);

        const newValue: ItemValueChange[] =
            changedIndex < 0
                ? (item.value as ItemValueChange[]).concat(newCurrencyAmount)
                : ([...item.value.slice(0, changedIndex), newCurrencyAmount, ...item.value.slice(changedIndex + 1)] as ItemValueChange[]);

        return ctx.messageUtil.replyWithSuccess(message, `Changed item price`, `The item ${inlineQuote(item.name)} ${displayPrice(newValue, serverCurrencies)}.`);
    },
};

async function removeItemValue(ctx: TuxoClient, message: Message, currency: Currency, currencies: Currency[], item: Item & { value: ItemValue[] }) {
    // Can't remove if it doesn't exist
    if (!item.value.find((x) => x.currencyId === currency.id))
        return ctx.messageUtil.replyWithError(
            message,
            "Currency is not in price",
            `The currency is either not rewarded or is part of default rewards. If you want to remove default rewards, create a new reward for the income command.`
        );

    await ctx.prisma.itemValue.deleteMany({
        where: {
            currencyId: currency.id,
            serverId: message.serverId!,
            itemId: item.id,
        },
    });

    const newValue = item.value.filter((x) => x.currencyId !== currency.id);

    return ctx.messageUtil.replyWithSuccess(
        message,
        "Price currency removed",
        `The item ${inlineQuote(item.name)} will no longer require ${displayCurrency(currency)} and ${displayPrice(newValue, currencies)}.`
    );
}

const displayPrice = (newValue: ItemValueChange[], currencies: Currency[]) =>
    newValue.length
        ? `now costs ${newValue
              .map((x) => {
                  const currency = currencies.find((y) => y.id === x.currencyId)!;

                  return displayCurrencyAmount(currency, x.amount);
              })
              .join(", ")}`
        : "is now free";

export default SetPrice;
