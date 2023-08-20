import { RoleType } from "@prisma/client";
import { inlineQuote } from "@yokilabs/bot";
import { ReactionInfo } from "@yokilabs/utils";

import { TAG_REGEX } from "../../util/matching";
import { Category, Command } from "../commands";

const Emote: Command = {
    name: "currency-emote",
    description: "Sets an emote icon for a specified currency.",
    subName: "emote",
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
            name: "emote",
            type: "emote",
        },
    ],
    execute: async (message, args, ctx) => {
        const tag = (args.tag as string).toLowerCase();
        const emote = args.emote as ReactionInfo;

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
        else if (currency.emote === emote.name)
            return ctx.messageUtil.replyWithError(message, "Already set", `The emote icon for the currency with tag ${inlineQuote(tag)} is already set to :${emote.name}:.`);

        await ctx.dbUtil.updateCurrency(currency, { emote: emote.name });

        return ctx.messageUtil.replyWithSuccess(message, "Emote set", `Currency with the tag ${inlineQuote(tag)} now has an emote icon :${emote.name}:.`);
    },
};

export default Emote;
