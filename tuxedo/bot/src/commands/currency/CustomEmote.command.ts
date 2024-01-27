import { RoleType } from "@prisma/client";
import { inlineQuote } from "@yokilabs/bot";

import { TAG_REGEX } from "../../util/matching";
import { Category, Command } from "../commands";

const CustomEmote: Command = {
    name: "currency-customemote",
    description: "Sets a custom emote icon for a specified currency.",
    subName: "customemote",
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

        // Currency needs to exist for it to be edited
        if (!currency) return ctx.messageUtil.replyWithError(message, "Doesn't exist", `The currency with tag ${inlineQuote(tag)} does not exist and cannot be edited.`);

        const reactionSelection = await ctx.messageUtil.replyWithInfo(message, `Select emote`, `React to this message with an emote you want to use as an icon of ${inlineQuote(currency.name)}.`);

        // Wait for the response
        ctx.lifetimedUtil.awaitingCurrencyEmotes.push({
            currency: currency,
            serverId: message.serverId!,
            channelId: message.channelId,
            messageId: reactionSelection.id,
            createdAt: Date.now(),
        });

        return;
    },
};

export default CustomEmote;
