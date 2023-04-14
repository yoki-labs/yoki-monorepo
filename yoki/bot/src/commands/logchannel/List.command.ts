import { Collection } from "@discordjs/collection";
import { LogChannelType } from "@prisma/client";
import { channelName, listInlineCode } from "@yokilabs/util";
import { stripIndents } from "common-tags";
import type { Channel, Message } from "guilded.js";

import type Client from "../../Client";
import { LogChannel as LogChannelPrisma, RoleType } from "../../typings";
import { Category, Command } from "../commands";

const List: Command = {
    name: "logs-list",
    description: "See all the enabled logchannels in this server.",
    usage: "[channel]",
    examples: ["channel_id", ""],
    subCommand: true,
    category: Category.Logs,
    subName: "list",
    requiredRole: RoleType.ADMIN,
    args: [{ name: "channel", type: "channel", optional: true }],
    execute: async (message, args, ctx) => {
        const channel = args.channel as Channel;

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
async function replyWithChannelList(logChannels: LogChannelPrisma[], message: Message, ctx: Client) {
    const formattedChannels = cleanupChannels(logChannels);
    const channelNames = (await Promise.all(formattedChannels.map((_, k) => ctx.channels.fetch(k).catch(() => k)))).map((x) =>
        typeof x === "string" ? `Unknown Channel - ${x}` : channelName(x.name, x.serverId, x.groupId, x.id)
    );

    return ctx.messageUtil.replyWithInfo(
        message,
        `Current log channels`,
        stripIndents`
            ${channelNames.map((channel, index) => `${channel}: ${listInlineCode(formattedChannels.at(index))}`).join("\n")}
        `
    );
}

async function replyWithChannel(channel: Channel, logTypes: LogChannelType[] | undefined, message: Message, ctx: Client) {
    return ctx.messageUtil.replyWithInfo(
        message,
        `Log channel subscriptions`,
        stripIndents`
            ${channelName(channel.name, channel.serverId, channel.groupId, channel.id)}: ${listInlineCode(logTypes)}
        `
    );
}

export default List;
