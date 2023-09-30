import { RoleType } from "@prisma/client";
import { inlineQuote } from "@yokilabs/bot";

import { TAG_REGEX } from "../../util/matching";
import { Category, Command } from "../commands";

const Tag: Command = {
    name: "currency-tag",
    description: "Changes the tag of the specified currency.",
    subName: "tag",
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
            name: "newTag",
            display: "new tag",
            type: "string",
            max: 1016,
        },
    ],
    execute: async (message, args, ctx) => {
        const tag = (args.tag as string).toLowerCase();
        const newTag = args.newTag as string;

        const oldTagCorrect = TAG_REGEX.test(tag);

        if (!(oldTagCorrect || TAG_REGEX.test(newTag)))
            return ctx.messageUtil.replyWithError(
                message,
                "Incorrect format",
                `The format of the currency's __${
                    oldTagCorrect ? "new" : "old"
                }__ tag has incorrect symbols. Only letters part of English alphabet, numbers, \`-\` and \`_\` are allowed.`
            );

        const currency = await ctx.dbUtil.getCurrency(message.serverId!, tag);

        // Currency needs to exist for it to be edited
        if (!currency) return ctx.messageUtil.replyWithError(message, "Doesn't exist", `The currency with tag ${inlineQuote(tag)} does not exist and cannot be edited.`);
        // No reason to do changes in the database
        else if (currency.tag === newTag) return ctx.messageUtil.replyWithError(message, "Already set", `The tag of the currency has already been set to ${inlineQuote(tag)}.`);

        await ctx.dbUtil.updateCurrency(currency, { tag: newTag });

        return ctx.messageUtil.replyWithSuccess(message, "Tag set", `Currency with the previous tag ${inlineQuote(tag)} now has a new tag ${inlineQuote(newTag)}.`);
    },
};

export default Tag;
