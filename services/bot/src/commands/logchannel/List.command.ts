import Collection from "@discordjs/collection";
import type { ChatMessagePayload, ServerChannelPayload } from "@guildedjs/guilded-api-typings";
import { LogChannelType } from "@prisma/client";
import { stripIndents } from "common-tags";

import type Client from "../../Client";
import { LogChannel as LogChannelPrisma, RoleType } from "../../typings";
import { listInlineCode } from "../../utils/formatters";
import { Category } from "../Category";
import type { Command } from "../Command";

const List: Command = {
    name: "logchannel-list",
    description: "See all the enabled logchannels in this server.",
    usage: "[channelId]",
    examples: ["channel_id", ""],
    subCommand: true,
    category: Category.Logs,
    subName: "list",
    requiredRole: RoleType.ADMIN,
    args: [{ name: "channelId", type: "channel", optional: true }],
    execute: async (message, args, ctx) => {
        const channel = args.channelId as ServerChannelPayload;

        const logChannels = await ctx.dbUtil.getLogChannels(message.serverId!);
        if (logChannels.length <= 0)
            return ctx.messageUtil.replyWithNullState(
                message,
                `No log channels`,
                stripIndents`
                There are no log channels set for this server.
                You can set the following types: ${listInlineCode(Object.values(LogChannelType))}
            `
            );

        if (channel === null) {
            return replyWithChannelList(logChannels, message, ctx);
        }
        const sameChannels = logChannels.filter((c) => c.channelId === channel.id);

        if (sameChannels.length <= 0) {
            return ctx.messageUtil.replyWithNullState(
                message,
                `No log types`,
                stripIndents`
                There are no log types set for that.
                You can set the following types: ${listInlineCode(Object.values(LogChannelType))}
            `
            );
        }

        const combinedChannel: Collection<string, LogChannelType[]> = await cleanupChannels(sameChannels);

        return replyWithChannel(channel, combinedChannel.first(), message, ctx);
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

// Gives channel list or nothing
async function replyWithChannelList(logChannels: LogChannelPrisma[], message: ChatMessagePayload, ctx: Client) {
    const formattedChannels = cleanupChannels(logChannels);
    const channelNames = (await Promise.all(formattedChannels.map((_, k) => ctx.channelUtil.getChannel(k).catch(() => k)))).map((x) =>
        typeof x === "string" ? `Unknown Channel - ${x}` : `[#${x.name}](https://www.guilded.gg/${x.serverId}/channels/${x.id}/chat)`
    );

    return ctx.messageUtil.replyWithInfo(
        message,
        `Current log channels`,
        stripIndents`
            ${channelNames.map((channel, index) => `${channel}: ${listInlineCode(formattedChannels.at(index))}`)}
        `
    );
}

async function replyWithChannel(channel: ServerChannelPayload, logTypes: LogChannelType[] | undefined, message: ChatMessagePayload, ctx: Client) {
    return ctx.messageUtil.replyWithInfo(
        message,
        `Log channel subscriptions`,
        stripIndents`
            [#${channel.name}](https://www.guilded.gg/${channel.serverId}/channels/${channel.id}/chat): ${listInlineCode(logTypes)}
        `
    );
}

export default List;
