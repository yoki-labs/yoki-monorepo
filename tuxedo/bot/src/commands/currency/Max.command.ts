import { RoleType } from "@prisma/client";
import { inlineCode, inlineQuote } from "@yokilabs/bot";

import { TAG_REGEX } from "../../util/matching";
import { Category, Command } from "../commands";

const Delete: Command = {
    name: "currency-maximum",
    description: "Sets a maximum value for a specified currency.",
    subName: "maximum",
    subCommand: true,
    category: Category.Economy,
    requiredRole: RoleType.ADMIN,
    args: [
        {
            name: "tag",
            type: "string",
            max: 16,
        },
        {
            name: "value",
            type: "number",
        }
    ],
    execute: async (message, args, ctx) => {
        const tag = (args.tag as string).toLowerCase();
        const value = args.value as number;

        if (!TAG_REGEX.test(tag))
            return ctx.messageUtil.replyWithError(
                message,
                "Incorrect format",
                "The format of the currency's tag has incorrect symbols. Only letters part of English alphabet, numbers, `-` and `_` are allowed."
            );

        const currency = await ctx.dbUtil.getCurrency(message.serverId!, tag);

        // Currency needs to exist for it to be edited
        if (!currency) return ctx.messageUtil.replyWithError(message, "Doesn't exist", `The currency with tag ${inlineQuote(tag)} does not exist and cannot be edited.`);

        // Check if the maximum balance is already set to the value
        if (currency.maximumBalance === value) return ctx.messageUtil.replyWithError(message, "Already set", `The maximum balance for the currency with tag ${inlineQuote(tag)} is already set to ${inlineCode(value.toString())}.`);
        // Check if the maximum balance is equal to or less than the starting balance
        if ((currency.startingBalance) && (currency.startingBalance >= value)) return ctx.messageUtil.replyWithError(message, "Invalid value", `The maximum balance for the currency with tag ${inlineQuote(tag)} cannot be equal to or less than the starting balance, which is ${currency.startingBalance}.`);

        await ctx.dbUtil.editCurrencyMaximumBalance(currency, value);

        return ctx.messageUtil.replyWithSuccess(message, "Currency maximum balance set", `Currency with the tag ${inlineQuote(tag)} now has a maximum balance of ${inlineQuote(value)}.`);
    },
};

export default Delete;
