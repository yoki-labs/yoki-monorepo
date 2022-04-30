import { Embed } from "@guildedjs/embeds";

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
        if (!existingEntry)
            return ctx.messageUtil.send(
                message.channelId,
                new Embed({
                    title: ":x: Phrase not found",
                    description: "This phrase is not in your server's filter!",
                    color: ctx.messageUtil.colors.bad,
                })
            );
        await ctx.dbUtil.removeWordFromFilter(message.serverId!, phrase);
        return ctx.messageUtil.send(
            message.channelId,
            new Embed({
                title: ":white_check_mark: Phrase deleted",
                description: `Successfully deleted \`${phrase}\` from the automod list!`,
                color: ctx.messageUtil.colors.good,
            })
        );
    },
};

export default Delete;
