import { Collection } from "@discordjs/collection";
import { LogChannelType } from "@prisma/client";
import { channelName, listInlineCode } from "@yokilabs/bot";

import { LogChannel as LogChannelPrisma, RoleType } from "../../typings";
import { Category, Command } from "../commands";

const List: Command = {
    name: "logs-list",
    description: "See all the enabled logchannels in this server.",
    // usage: "[channel]",
    examples: ["channel_id", ""],
    subCommand: true,
    category: Category.Settings,
    subName: "list",
    requiredRole: RoleType.ADMIN,
    execute: async (message, _args, ctx) => {
        const logChannels = await ctx.dbUtil.getLogChannels(message.serverId!);

        const formattedChannels = cleanupChannels(logChannels);
        const channelNames = (await Promise.all(formattedChannels.map((_, k) => ctx.channels.fetch(k).catch(() => k)))).map((x) =>
            typeof x === "string" ? `Unknown Channel - ${x}` : channelName(x.name, x.serverId, x.groupId, x.id)
        );

        return ctx.messageUtil.replyWithList(
            message,
            `Current log channels`,
            channelNames.map((channel, index) => `\u2022 ${channel}: ${listInlineCode(formattedChannels.at(index))}`),
            `You can set the following types: ${listInlineCode(Object.values(LogChannelType))}`
        );
    },
};

function cleanupChannels(logChannels: LogChannelPrisma[]): Collection<string, LogChannelType[]> {
    const channels = new Collection<string, LogChannelType[]>();

    logChannels.forEach((channel) => {
        if (channels.has(channel.channelId)) {
            channels.get(channel.channelId)?.push(channel.type);
        } else {
            const newArray: LogChannelType[] = [channel.type];
            channels.set(channel.channelId, newArray);
        }
    });

    return channels;
}

export default List;
