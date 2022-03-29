import { removeWordFromFilter } from "../../functions/content-filter";
import type { Command } from "../Command.spec";

export default {
    name: "delete",
    description: "Remove a word or phrase from the automod filter",
    args: [
        {
            name: "phrase",
            type: "string",
        },
    ],
    execute: async (message, args, _commandCtx, ctx) => {
        const phrase = args.phrase as string;
        const existingEntry = await ctx.prisma.contentFilter.findFirst({ where: { serverId: message.serverId!, content: phrase } });
        if (!existingEntry) return ctx.rest.router.createChannelMessage(message.channelId, "This phrase is not in your server's filter!");
        await removeWordFromFilter(ctx.prisma, message.serverId!, phrase);
        return ctx.rest.router.createChannelMessage(message.channelId, `Successfully deleted \`${phrase}\` from the automod list!`);
    },
} as Command;
