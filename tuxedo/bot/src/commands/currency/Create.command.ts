import { inlineQuote } from "@yokilabs/bot";
import { TAG_REGEX } from "../../util/matching";
import { Category, Command } from "../commands";
import { RoleType } from "@prisma/client";

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
            name: "name",
            type: "rest",
            max: 100,
        },
    ],
    execute: async (message, args, ctx) => {
        const tag = (args.tag as string).toLowerCase();
        const name = args.name as string;

        if (!TAG_REGEX.test(tag))
            return ctx.messageUtil.replyWithError(
                message,
                "Incorrect format",
                "The format of the currency's tag has incorrect symbols. Only letters part of English alphabet, numbers, `-` and `_` are allowed."
            );

        // Tags are supposed to be unique
        const currencies = await ctx.dbUtil.getCurrencies(message.serverId!);

        if (currencies.find(x => x.tag === tag))
            return ctx.messageUtil.replyWithError(message, "Already exists", `The currency with tag ${inlineQuote(tag)} already exists.`);
        else if (currencies.length >= 3)
            return ctx.messageUtil.replyWithError(message, "Too many currencies", `You have created the maximum amount of currencies there can be.`);

        await ctx.dbUtil.createCurrency(message.serverId!, tag, name, message.createdById);

        return ctx.messageUtil.replyWithSuccess(message, "Currency created", `Currency with tag ${inlineQuote(tag)} has been successfully created.`);
    },
};

export default Create;
