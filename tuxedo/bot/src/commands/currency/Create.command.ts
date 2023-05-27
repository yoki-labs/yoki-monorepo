import { inlineCode } from "@yokilabs/bot";
import { TAG_REGEX } from "../../util/matching";
import { Category, Command } from "../commands";

const Create: Command = {
    name: "currency-create",
    description: "Creates a new currency.",
    subName: "create",
    subCommand: true,
    category: Category.Economy,
    // requiredRole: RoleType.MOD,
    args: [
        {
            name: "tag",
            type: "string",
            max: 16
        },
        {
            name: "name",
            type: "string",
            max: 100
        }
    ],
    execute: async (message, args, ctx) => {
        const tag = args.tag as string;
        const name = args.name as string;

        if (!TAG_REGEX.test(tag))
            return ctx.messageUtil.replyWithError(message, "Incorrect format", "The format of the currency's tag has incorrect symbols. Only letters part of English alphabet, numbers, `-` and `_` are allowed.");

        // Tags are supposed to be unique
        if (await ctx.dbUtil.getCurrency(message.serverId!, tag))
            return ctx.messageUtil.replyWithError(message, "Already exists", `The currency with tag $${inlineCode(tag)} already exists.`);

        await ctx.dbUtil.createCurrency(message.serverId!, tag, name);

        return ctx.messageUtil.replyWithSuccess(message, "Currency created", `Currency $${inlineCode(tag)} has been successfully created.`);
    },
};

export default Create;
