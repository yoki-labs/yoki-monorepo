import { inlineCode, listInlineCode } from "@yokilabs/bot";
import { stripIndents } from "common-tags";
import type { Channel, Message } from "guilded.js";

import type Client from "../../Client";
import { LogChannelType, RoleType } from "../../typings";
import { Category, Command } from "../commands";

// With the ability to remove it
const LogChannelArgs = { ...LogChannelType };

type LogChannelArgEnum = keyof typeof LogChannelArgs;

const Remove: Command = {
    name: "logs-remove",
    description: "Unsubscribe a specified channel from a specified log type.",
    // usage: "<channel> [logTypes]",
    subCommand: true,
    category: Category.Settings,
    subName: "remove",
    requiredRole: RoleType.ADMIN,
    args: [
        { name: "channel", optional: false, type: "channel" },
        { name: "logTypes", display: "log types", optional: true, type: "enumList", values: LogChannelArgs },
    ],
    execute: async (message, args, ctx) => {
        const { id: channelId } = args.channel as Channel;
        let logTypes: LogChannelArgEnum[] = args.logTypes === null ? [] : (args.logTypes as LogChannelArgEnum[]);

        // If there are logTypes, uppercase them all, then filter out duplicates. No idea why this had to specifically be two different lines.
        if (logTypes && logTypes.length > 0) {
            logTypes = logTypes.filter((value, index) => logTypes!.indexOf(value) === index);
        }

        // If logTypes is empty or includes ALL, shorten it to only ALL to clean up the process.
        if (logTypes?.length === 0 || logTypes?.includes("all")) {
            await ctx.prisma.logChannel.findMany({ where: { channelId, serverId: message.serverId! } }).then((logChannels) =>
                logChannels.forEach((logChannel) => {
                    logTypes?.push(logChannel.type);
                })
            );
        }

        const [successfulTypes, failedTypes] = await unsubscribeToLogs(ctx, message, channelId, logTypes as LogChannelType[]);

        // Reply to the command, with the successful and failed types.
        return ctx.messageUtil[successfulTypes.length > 0 ? "replyWithSuccess" : "replyWithAlert"](
            message,
            successfulTypes.length > 0 ? `Subscriptions removed` : `No subscriptions removed`,
            stripIndents`
                ${successfulTypes.length > 0 ? `Successfully unsubscribed channel ${inlineCode(channelId)} from the following events: ${listInlineCode(successfulTypes)}` : ""}
                ${
                    failedTypes.length > 0
                        ? `Failed to unsubscribe channel ${inlineCode(channelId)} from the following events: ${listInlineCode(
                              failedTypes.map((x) => x[0])
                          )} due to the following reason(s) ${listInlineCode(failedTypes.map((x) => x[1]))}`
                        : ""
                }
            `
        );
    },
};

async function unsubscribeToLogs(ctx: Client, message: Message, channelId: string, logTypes: LogChannelType[]): Promise<[string[], string[][]]> {
    // Event unsubscribe handling.
    const failedTypes: string[][] = [];
    const successfulTypes: string[] = [];

    for (const logType of logTypes) {
        if (LogChannelType[logType] && (await ctx.dbUtil.getLogChannel(message.serverId!, LogChannelType[logType]))) {
            try {
                await ctx.prisma.logChannel.deleteMany({ where: { channelId, serverId: message.serverId!, type: LogChannelType[logType] } });
                successfulTypes.push(logType);
            } catch (e) {
                failedTypes.push([logType, "INTERNAL_ERROR"]);
            }
        } else {
            failedTypes.push([logType, LogChannelType[logType] ? "CHANNEL_NOT_SUBSCRIBED" : "INVALID_LOG_TYPE"]);
        }
    }

    return [successfulTypes, failedTypes];
}

export default Remove;
