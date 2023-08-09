import { RoleType } from "@prisma/client";
import { inlineQuote } from "@yokilabs/bot";

import { TAG_REGEX } from "../../util/matching";
import { Category, Command } from "../commands";

const CanDeposit: Command = {
    name: "currency-candeposit",
    description: "Sets whether the specified currency can be deposited.",
    subName: "candeposit",
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
            name: "depositable",
            display: "can deposit",
            type: "boolean",
        },
    ],
    execute: async (message, args, ctx) => {
        const tag = (args.tag as string).toLowerCase();
        const depositable = args.depositable as boolean;

        if (!TAG_REGEX.test(tag))
            return ctx.messageUtil.replyWithError(
                message,
                "Incorrect format",
                "The format of the currency's tag has incorrect symbols. Only letters part of English alphabet, numbers, `-` and `_` are allowed."
            );

        const currency = await ctx.dbUtil.getCurrency(message.serverId!, tag);

        // Currency needs to exist for it to be edited
        if (!currency) return ctx.messageUtil.replyWithError(message, "Doesn't exist", `The currency with tag ${inlineQuote(tag)} does not exist and cannot be edited.`);
        // No reason to do changes in the database
        // Comparing booleans kinda feels eugh...
        else if (currency.bankEnabled === depositable)
            return ctx.messageUtil.replyWithError(
                message,
                "Already set",
                `The bank for the currency with tag ${inlineQuote(tag)} is already ${depositable ? "enabled" : "disabled"}.`
            );

        await ctx.dbUtil.updateCurrency(currency, { bankEnabled: depositable });

        return ctx.messageUtil.replyWithSuccess(message, depositable ? "Bank enabled" : "Bank disabled", `Currency with the tag ${inlineQuote(tag)} now has bank ${depositable ? "enabled" : "disabled"}.`);
    },
};

export default CanDeposit;
