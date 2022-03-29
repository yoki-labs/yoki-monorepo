import { addWordToFilter, optionKeys, transformSeverityStringToEnum } from "../../functions/content-filter";
import type { Command } from "../Command.spec";

export default {
    name: "add",
    description: "Add a word or phrase to the automod filter",
    args: [
        {
            name: "phrase",
            type: "string",
        },
        {
            name: "severity",
            type: "string",
        },
    ],
    execute: async (message, args, _commandCtx, ctx) => {
        const phrase = args.phrase as string;
        const severity = args.severity as string;
        if (!optionKeys.includes(severity))
            return ctx.rest.router.createChannelMessage(message.channelId, "Sorry, but that is not a valid severity level!");
        const doesExistAlready = await ctx.prisma.contentFilter.findFirst({ where: { serverId: message.serverId!, content: phrase } });
        if (doesExistAlready) return ctx.rest.router.createChannelMessage(message.channelId, "This word is already in your server's filter!");
        await addWordToFilter(ctx.prisma, {
            content: phrase,
            creatorId: message.createdBy,
            serverId: message.serverId!,
            severity: transformSeverityStringToEnum(severity),
        });
        return ctx.rest.router.createChannelMessage(message.channelId, `Successfully added \`${phrase}\` to the automod list!`);
    },
} as Command;
