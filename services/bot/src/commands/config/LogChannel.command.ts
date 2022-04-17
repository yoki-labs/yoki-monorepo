import { stripIndents } from "common-tags";

import { LogChannelType, RoleType } from "../../typings";
import type { Command } from "../Command";

function cleanupChannels(logChannels): Map<string, LogChannelType[]> {
    const channels = new Map<string, LogChannelType[]>();

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

const LogChannel: Command = {
    name: "config-logchannel",
    description: "Set or view whether message updates are logged to the mod log channel.",
    usage: "[channelId] [action] [logTypes]",
    subCommand: true,
    subName: "logchannel",
    requiredRole: RoleType.ADMIN,
    args: [
        { name: "channelId", optional: true, type: "UUID" },
        { name: "logTypes", optional: true, type: "listRest", separator: " | " },
    ],
    execute: async (message, args, ctx) => {
        const channelId = args.channelId as string;
        let logTypes = <string[]>args.logTypes;
        if (logTypes.length > 0) {
            logTypes = logTypes.map((logType) => logType.toUpperCase());
            logTypes = logTypes.filter((value, index) => logTypes.indexOf(value) === index);
        }

        if (!channelId) {
            const logChannels = await ctx.serverUtil.getLogChannels(message.serverId!);
            if (logChannels.length <= 0) return ctx.messageUtil.send(message.channelId, `This server has no set log channels.`);

            const formattedChannels: Map<string, LogChannelType[]> = await cleanupChannels(logChannels);

            return ctx.messageUtil.send(
                message.channelId,
                stripIndents`
                    This server has the following log channels:
                    ${Array.from(formattedChannels, ([channelId, channelTypes]) => `***${channelId}:*** \`${channelTypes.join("`, `")}\`\n`)}
                `
            );
        }

        const failedTypes: string[] = [];
        const successfulTypes: string[] = [];
        if (logTypes.length <= 0 || logTypes.includes("ALL")) {
            logTypes = ["ALL"];
        }

        if (await ctx.prisma.logChannel.findFirst({ where: { channelId, type: LogChannelType.ALL } })) {
            failedTypes.push(`ALL_TYPES:CHANNEL_ALREADY_SUBSCRIBED_TO_ALL`);
        } else {
            for (const logType of logTypes) {
                if (LogChannelType[logType] && !(await ctx.prisma.logChannel.findFirst({ where: { channelId, type: LogChannelType[logType] } }))) {
                    try {
                        await ctx.prisma.logChannel.create({ data: { channelId, serverId: message.serverId!, type: LogChannelType[logType] } });

                        successfulTypes.push(logType);
                    } catch (e) {
                        failedTypes.push(`${logType}:COULD_NOT_SUBSCRIBE`);
                    }
                } else {
                    failedTypes.push(`${logType}:${LogChannelType[logType] ? "CHANNEL_ALREADY_SUBSCRIBED_TO_LOG_TYPE" : "INVALID_LOG_TYPE"}`);
                }
            }
        }

        return ctx.messageUtil.send(
            message.channelId,
            stripIndents`
                ${
                    successfulTypes.length > 0
                        ? `Successfully subscribed channel \`${channelId}\` to the following events: ${successfulTypes.map((type) => `\`${type}\``).join(", ")}`
                        : ""
                }
                ${failedTypes.length > 0 ? `Failed to subscribe channel \`${channelId}\` to the following events: ${failedTypes.map((type) => `\`${type}\``).join(", ")}` : ""}
            `
        );
    },
};

export default LogChannel;
