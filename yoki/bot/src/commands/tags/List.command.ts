import { RoleType } from "@prisma/client";
import { inlineCode } from "@yokilabs/bot";

import { Category, Command } from "../commands";

const List: Command = {
    name: "tag-list",
    subName: "list",
    description: "Get all the custom tags.",
    usage: "",
    subCommand: true,
    category: Category.Tags,
    requiredRole: RoleType.MOD,
    args: [
        {
            name: "page",
            type: "number",
            optional: true,
        },
    ],
    execute: async (message, args, ctx) => {
        const page = args.page ? Math.floor((args.page as number) - 1) : 0;
        const serverTags = await ctx.prisma.customTag.findMany({ where: { serverId: message.serverId! } });
        if (!serverTags.length) return ctx.messageUtil.replyWithNullState(message, "No tags", "This server doesn't have any tags yet.");

        return ctx.messageUtil.replyWithPaginatedContent({
            replyTo: message,
            title: "List of tags",
            items: serverTags,
            itemMapping: (tag) => `${inlineCode(tag.id)} - ${inlineCode(tag.name)}`,
            itemsPerPage: 10,
            page,
        });
    },
};

export default List;
