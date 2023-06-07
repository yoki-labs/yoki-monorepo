import { RoleType } from "@prisma/client";
import { inlineQuote } from "@yokilabs/bot";

import { TAG_REGEX } from "../../util/matching";
import { Category, Command } from "../commands";

const Delete: Command = {
    name: "currency-delete",
    description: "Deletes an existing currency.",
    subName: "delete",
    subCommand: true,
    category: Category.Economy,
    requiredRole: RoleType.ADMIN,
    args: [
        {
            name: "tag",
            type: "string",
            max: 16,
        },
    ],
    execute: async (message, args, ctx) => {
        const tag = (args.tag as string).toLowerCase();

        if (!TAG_REGEX.test(tag))
            return ctx.messageUtil.replyWithError(
                message,
                "Incorrect format",
                "The format of the currency's tag has incorrect symbols. Only letters part of English alphabet, numbers, `-` and `_` are allowed."
            );

        const currency = await ctx.dbUtil.getCurrency(message.serverId!, tag);

        // Currency needs to exist for it to be deleted
        if (!currency) return ctx.messageUtil.replyWithError(message, "Doesn't exist", `The currency with tag ${inlineQuote(tag)} does not exist and cannot be deleted.`);

        await ctx.dbUtil.deleteCurrency(currency);

        return ctx.messageUtil.replyWithSuccess(message, "Currency deleted", `Currency with the tag ${inlineQuote(tag)} has been successfully deleted.`);
    },
};

export default Delete;
