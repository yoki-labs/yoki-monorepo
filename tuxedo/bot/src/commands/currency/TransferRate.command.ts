import { RoleType } from "@prisma/client";
import { inlineCode, inlineQuote } from "@yokilabs/bot";

import { TAG_REGEX } from "../../util/matching";
import { Category, Command } from "../commands";

const Max: Command = {
    name: "currency-transferrate",
    description: "Sets the percentage of currency that will be sent to another user. Allows to set fee or disable transferring.",
    subName: "transferrate",
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
            allowDecimal: true,
            max: 1,
            min: 0,
        },
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
        // No reason to do changes in the database
        else if (currency.transferRate === value)
            return ctx.messageUtil.replyWithError(
                message,
                "Already set",
                `The transfer rate for the currency with tag ${inlineQuote(tag)} is already set to ${inlineCode(value.toString())}.`
            );

        await ctx.dbUtil.updateCurrency(currency, { transferRate: value });

        return ctx.messageUtil.replyWithSuccess(
            message,
            "Transfer rate set",
            `Currency with the tag ${inlineQuote(tag)} now has transfer rate of ${inlineQuote(`${value * 100}%`)}.`
        );
    },
};

export default Max;
