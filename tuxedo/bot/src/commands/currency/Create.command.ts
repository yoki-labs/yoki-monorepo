import { RoleType } from "@prisma/client";
import { inlineQuote } from "@yokilabs/bot";
import { createServerLimit } from "@yokilabs/bot/src/premium";
import { ReactionInfo } from "@yokilabs/utils";

import { TAG_REGEX } from "../../util/matching";
import { Category, Command } from "../commands";

const getServerLimit = createServerLimit({
    Gold: 12,
    Silver: 8,
    Copper: 6,
    Early: 5,
    Default: 3,
});

const Create: Command = {
    name: "currency-create",
    description: "Creates a new currency locally for this server.",
    subName: "create",
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
            display: "emote icon",
            type: "emote",
            max: 100,
        },
        {
            name: "name",
            type: "rest",
            max: 100,
        },
    ],
    execute: async (message, args, ctx, { server }) => {
        const tag = (args.tag as string).toLowerCase();
        const name = args.name as string;
        const emote = args.emote as ReactionInfo;

        if (!TAG_REGEX.test(tag))
            return ctx.messageUtil.replyWithError(
                message,
                "Incorrect format",
                "The format of the currency's tag has incorrect symbols. Only letters part of English alphabet, numbers, `-` and `_` are allowed."
            );

        // Tags are supposed to be unique
        const currencies = await ctx.dbUtil.getCurrencies(message.serverId!);

        if (currencies.find((x) => x.tag === tag)) return ctx.messageUtil.replyWithError(message, "Already exists", `The currency with tag ${inlineQuote(tag)} already exists.`);

        // To not create too many of them for DB to blow up
        const serverLimit = getServerLimit(server);

        if (currencies.length >= serverLimit)
            return ctx.messageUtil.replyWithError(
                message,
                "Too many currencies",
                `You can only have ${serverLimit} currencies per server.${server.premium ? "" : "\n\n**Note:** You can upgrade to premium to increase the limit."}`
            );

        await ctx.dbUtil.createCurrency(message.serverId!, tag, emote.name, name, message.createdById);

        return ctx.messageUtil.replyWithSuccess(message, "Currency created", `Currency with tag ${inlineQuote(tag)} has been successfully created.`);
    },
};

export default Create;
