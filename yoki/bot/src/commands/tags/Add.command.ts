import { RoleType } from "@prisma/client";

import { inlineCode } from "@yokilabs/util";
import { Command, Category } from "../commands";

const Add: Command = {
    name: "tag-add",
    subName: "add",
    description: "Add a custom tag.",
    usage: "<tag-name> <...tag-content>",
    subCommand: true,
    category: Category.Tags,
    requiredRole: RoleType.MOD,
    args: [
        {
            name: "tagName",
            type: "string",
        },
        {
            name: "tagContent",
            type: "rest",
        },
    ],
    execute: async (message, args, ctx) => {
        const tagName = args.tagName as string;
        const tagContent = args.tagContent as string;

        if (tagName.length > 120) return ctx.messageUtil.replyWithError(message, `Content too long`, "Tag name is too long! Please shorten it to under 120 characters.");
        if (tagContent.length > 800) return ctx.messageUtil.replyWithError(message, `Name too long`, "Tag content is too long! Please shorten it to under 800 characters.");

        const doesAlreadyExist = await ctx.prisma.customTag.findFirst({ where: { serverId: message.serverId!, name: tagName } });
        if (doesAlreadyExist) return ctx.messageUtil.replyWithError(message, `Already exists`, "There is already a tag with that name.");

        await ctx.prisma.customTag.create({ data: { content: tagContent, name: tagName, serverId: message.serverId! } });
        return ctx.messageUtil.replyWithSuccess(message, "Tag created!", `A tag with the name ${inlineCode(tagName)} has been created.`);
    },
};

export default Add;
