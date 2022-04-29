import { RoleType } from "../../typings";
import { Category } from "../Category";
import type { Command } from "../Command";

const Delete: Command = {
    name: "filter-remove",
    subName: "remove",
    description: "Remove a word or phrase from the automod filter",
    usage: "<phrase>",
    subCommand: true,
    category: Category.Moderation,
    requiredRole: RoleType.ADMIN,
    args: [
        {
            name: "phrase",
            type: "string",
        },
    ],
    execute: async (message, args, ctx) => {
        const phrase = args.phrase as string;
        const existingEntry = await ctx.prisma.contentFilter.findFirst({ where: { serverId: message.serverId!, content: phrase } });
        if (!existingEntry) return ctx.messageUtil.send(message.channelId, "This phrase is not in your server's filter!");
        await ctx.dbUtil.removeWordFromFilter(message.serverId!, phrase);
        return ctx.messageUtil.send(message.channelId, `Successfully deleted \`${phrase}\` from the automod list!`);
    },
};

export default Delete;
