import Collection from "@discordjs/collection";
import type { ChatMessagePayload } from "@guildedjs/guilded-api-typings";
import { LogChannelType } from "@prisma/client";
import { stripIndents } from "common-tags";

import type Client from "../../../Client";
import { LogChannel as LogChannelPrisma, RoleType } from "../../../typings";
import { listInlineCode } from "../../../utils/formatters";
import { Category } from "../../Category";
import type { Command } from "../../Command";

const List: Command = {
    name: "logchannel-list",
    description: "List all possible Log Channel types.",
    usage: "[channelId]",
    examples: ["channel_id", ""],
    subCommand: true,
    category: Category.Logs,
    subName: "list",
    requiredRole: RoleType.ADMIN,
    args: [
        { name: "channelId", type: "UUID", optional: true }
    ],
    execute: async (message, args, ctx) => {
        const channelId = args.channelId as string;

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


        if (channelId === null) {
            return replyWithChannelList(logChannels, message, ctx);
        }
        const sameChannels = logChannels.filter((channel) => channel.channelId === channelId);

        if (sameChannels.length <= 0) {
            return ctx.messageUtil.replyWithNullState(
                message,
                `No log types`,
                stripIndents`
                There are no log types set for the channel ${channelId}.
                You can set the following types: ${listInlineCode(Object.values(LogChannelType))}
            `
            );
        }

        const combinedChannel: Collection<string, LogChannelType[]> = await cleanupChannels(sameChannels);

        return replyWithChannel(channelId, combinedChannel.first(), message, ctx);

    }
};

function cleanupChannels(logChannels: LogChannelPrisma[]) {
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
    const formattedChannels: Collection<string, LogChannelType[]> = await cleanupChannels(logChannels);

    return ctx.messageUtil.replyWithInfo(
        message,
        `Log channels`,
        stripIndents`
            This server has the following log channels:
            ${formattedChannels.map((v, k) => `***${k}:*** ${listInlineCode(v)}`).join("\n")}
        `
    );
}

async function replyWithChannel(channelId: string, logTypes: LogChannelType[] | undefined, message: ChatMessagePayload, ctx: Client) {
    return ctx.messageUtil.replyWithInfo(
        message,
        `Channel Log Types`,
        stripIndents`
            Channel \`${channelId}\`'s Log Types:
            ${listInlineCode(logTypes)}
        `
    );
}

export default List;
