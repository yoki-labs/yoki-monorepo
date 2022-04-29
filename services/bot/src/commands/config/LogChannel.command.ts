import Collection from "@discordjs/collection";
import { stripIndents } from "common-tags";

import { inlineCodeblock, listInlineCodeblock } from "../../formatters";
import { LogChannel as LogChannelPrisma, LogChannelType, RoleType } from "../../typings";
import { Category } from "../Category";
import type { Command } from "../Command";

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

const LogChannel: Command = {
    name: "config-logchannel",
    description: "Set or view whether message updates are logged to the mod log channel.",
    usage: "[channelId] [action] [logType | logType | logType]",
    subCommand: true,
    subName: "logchannel",
    category: Category.Settings,
    requiredRole: RoleType.ADMIN,
    args: [
        { name: "channelId", optional: true, type: "UUID" },
        { name: "logTypes", optional: true, type: "listRest", separator: " | " },
    ],
    execute: async (message, args, ctx) => {
        const channelId = args.channelId as string;
        let logTypes = args.logTypes as string[];

        // If there are logTypes, uppercase them all, then filter out duplicates. No idea why this had to specifically be two different lines.
        if (logTypes.length > 0) {
            logTypes = logTypes.map((logType) => logType.toUpperCase());
            logTypes = logTypes.filter((value, index) => logTypes.indexOf(value) === index);
        }

        // If the user didn't supply a channelId. Get all log channels, use above cleanup method to filter duplicates and merge them, then list them.
        if (!channelId) {
            const logChannels = await ctx.dbUtil.getLogChannels(message.serverId!);
            if (logChannels.length <= 0) return ctx.messageUtil.send(message.channelId, `This server has no set log channels.`);

            const formattedChannels: Collection<string, LogChannelType[]> = await cleanupChannels(logChannels);

            return ctx.messageUtil.send(
                message.channelId,
                stripIndents`
                    This server has the following log channels:
                    ${formattedChannels.map((v, k) => `***${k}:*** ${listInlineCodeblock(v)}`).join("\n")}
                `
            );
        }

        // Event subscribe handling.
        const failedTypes: string[][] = [];
        const successfulTypes: string[] = [];

        // If there aren't any logTypes or logTypes contains "ALL" default the entire list to ALL for optimization.
        if (logTypes.length === 0 || logTypes.includes("ALL")) {
            logTypes = ["ALL"];
        }

        // If the channel's already subscribed to all events.
        // Else, loop through all logTypes, if it's a valid LogChannelType, and doesn't already exist, go ahead and subscribe.

        // If it's successfully added, add the logType to the successfulTypes array.
        // Else, add it to the failedTypes array, with a reason. `TYPE:ERROR`
        /* if (await ctx.prisma.logChannel.findFirst({ where: { serverId: message.serverId, type: LogChannelType.ALL } })) {
            failedTypes.push(`SERVER_ALREADY_SUBSCRIBED_TO_ALL`);
        } else {*/
        for (const logType of logTypes) {
            if (LogChannelType[logType] && !(await ctx.prisma.logChannel.findFirst({ where: { serverId: message.serverId, type: LogChannelType[logType] } }))) {
                try {
                    await ctx.prisma.logChannel.create({ data: { channelId, serverId: message.serverId!, type: LogChannelType[logType] } });
                    successfulTypes.push(logType);
                } catch (e) {
                    failedTypes.push([logType, "INTERNAL_ERROR"]);
                }
            } else {
                failedTypes.push([logType, LogChannelType[logType] ? `MAX_1_REACHED` : "INVALID_LOG_TYPE"]);
            }
        }
        // }

        // Reply to the command, with the successful and failed types.
        return ctx.messageUtil.send(
            message.channelId,
            stripIndents`
                ${
                    successfulTypes.length > 0
                        ? `Successfully subscribed channel ${inlineCodeblock(channelId)} to the following events: ${listInlineCodeblock(successfulTypes)}`
                        : ""
                }
                ${
                    failedTypes.length > 0
                        ? `Failed to subscribe channel \`${channelId}\` to the following events: ${listInlineCodeblock(
                              failedTypes.map((x) => x[0])
                          )} due to the following reason(s) ${listInlineCodeblock(failedTypes.map((x) => x[1]))}`
                        : ""
                }
            `
        );
    },
};

export default LogChannel;
