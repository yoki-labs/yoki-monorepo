import { RoleType } from "@prisma/client";

import { inlineCode } from "@yokilabs/util";
import { Command, Category } from "../commands";

const Remove: Command = {
    name: "tag-remove",
    subName: "remove",
    description: "Remove a custom tag.",
    usage: "<tag-name>",
    subCommand: true,
    category: Category.Tags,
    requiredRole: RoleType.MOD,
    args: [
        {
            name: "tagName",
            type: "string",
        },
    ],
    execute: async (message, args, ctx) => {
        const tagName = args.tagName as string;
        const doesAlreadyExist = await ctx.prisma.customTag.findFirst({ where: { serverId: message.serverId!, name: tagName } });
        if (!doesAlreadyExist) return ctx.messageUtil.replyWithUnexpected(message, "A tag with that name does not exist.");

        await ctx.prisma.customTag.delete({ where: { id: doesAlreadyExist.id } });
        return ctx.messageUtil.replyWithSuccess(message, "Tag deleted!", `The tag ${inlineCode(tagName)} has been deleted.`);
    },
};

export default Remove;
