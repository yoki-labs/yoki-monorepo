import { RoleType } from "../../typings";
import type { Command } from "../Command";

const Delete: Command = {
    name: "filter-remove",
    subName: "remove",
    description: "Remove a word or phrase from the automod filter",
    usage: "<phrase>",
    subCommand: true,
    requiredRole: RoleType.ADMIN,
    args: [
        {
            name: "phrase",
            type: "string",
        },
    ],
    execute: async (message, args, { prisma, messageUtil, contentFilterUtil }) => {
        const phrase = args.phrase as string;
        const existingEntry = await prisma.contentFilter.findFirst({ where: { serverId: message.serverId!, content: phrase } });
        if (!existingEntry) return messageUtil.send(message.channelId, "This phrase is not in your server's filter!");
        await contentFilterUtil.removeWordFromFilter(message.serverId!, phrase);
        return messageUtil.send(message.channelId, `Successfully deleted \`${phrase}\` from the automod list!`);
    },
};

export default Delete;
