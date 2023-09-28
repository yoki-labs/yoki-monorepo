import { RoleType } from "@prisma/client";
import { inlineCode, inlineQuote } from "@yokilabs/bot";

import { TAG_REGEX } from "../../util/matching";
import { Category, Command } from "../commands";

const Name: Command = {
    name: "currency-name",
    description: "Changes the name of the specified currency.",
    subName: "name",
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
            name: "newName",
            display: "new name",
            type: "string",
            max: 100,
        },
    ],
    execute: async (message, args, ctx) => {
        const tag = (args.tag as string).toLowerCase();
        const newName = args.newName as string;

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
        else if (currency.name === newName)
            return ctx.messageUtil.replyWithError(
                message,
                "Already set",
                `The name for the currency with tag ${inlineQuote(tag)} has already been set to ${inlineCode(newName)}.`
            );

        await ctx.dbUtil.updateCurrency(currency, { name: newName });

        return ctx.messageUtil.replyWithSuccess(message, "Name set", `Currency with the tag ${inlineQuote(tag)} now has a name ${inlineQuote(newName)}.`);
    },
};

export default Name;
