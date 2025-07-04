import { chatChannelTypes, inlineCode, listInlineCode } from "@yokilabs/bot";
import { stripIndents } from "common-tags";
import type { Channel, Message } from "guilded.js";

import type Client from "../../Client";
import { LogChannelType, RoleType } from "../../typings";
import { Category, Command } from "../commands";

// With the ability to remove it
const LogChannelArgs = { ...LogChannelType };

type LogChannelArgEnum = keyof typeof LogChannelArgs;

const Set: Command = {
    name: "logs-set",
    description: "Subscribe the specified channel to the specified log type.",
    subCommand: true,
    category: Category.Settings,
    subName: "set",
    requiredRole: RoleType.ADMIN,
    // usage: "<channel> [logTypes]",
    args: [
        { name: "channel", optional: false, type: "channel" },
        { name: "logTypes", display: "log types", optional: true, type: "enumList", values: LogChannelArgs },
    ],
    execute: async (message, args, ctx) => {
        const channel = args.channel as Channel;
        let logTypes: LogChannelArgEnum[] = args.logTypes === null ? [] : (args.logTypes as LogChannelArgEnum[]);

        // const channel = await ctx.channels.fetch(channelId).catch(() => null);
        // if (!channel)
        //     return ctx.messageUtil.replyWithError(
        //         message,
        //         "Sorry! That is not a valid channel!",
        //         "Please ensure that the provided ID belongs to a channel that I can see! I also require `MANAGE CHANNEL` permissions to be able to grab that channel!"
        //     );
        if (!(channel.type & chatChannelTypes))
            return ctx.messageUtil.replyWithError(message, "Not a chat channel", "The provided channel is not a chat channel, voice channenl or streaming channel.");

        // If there are logTypes, uppercase them all, then filter out duplicates. No idea why this had to specifically be two different lines.
        if (logTypes && logTypes.length > 0) {
            logTypes = logTypes.filter((value, index) => logTypes!.indexOf(value) === index);
        }

        // If logTypes is empty or includes ALL, shorten it to only ALL to clean up the process.
        if (logTypes?.length === 0 || logTypes?.includes("all")) {
            logTypes = ["all"];
        }

        try {
            await ctx.messageUtil.send(channel.id, "Checking for permission to send here...").then((x) => ctx.messages.delete(channel.id, x.id).catch(() => null));
        } catch (e) {
            return ctx.messageUtil.replyWithError(
                message,
                `Yoki has no permissions`,
                `I don't have the permissions to send messages in that channel! Please make sure I have send messages, read messages, and manage channel permissions in that channel.`
            );
        }

        const [successfulTypes, failedTypes] = await subscribeToLogs(ctx, message, channel.id, logTypes as LogChannelType[]);

        // Reply to the command, with the successful and failed types.
        return ctx.messageUtil[successfulTypes.length > 0 ? "replyWithSuccess" : "replyWithError"](
            message,
            successfulTypes.length > 0 ? `Subscriptions added` : `No subscriptions added`,
            stripIndents`
                ${successfulTypes.length > 0 ? `Successfully subscribed channel ${inlineCode(channel.id)} to the following events: ${listInlineCode(successfulTypes)}` : ""}
                ${
                    failedTypes.length > 0
                        ? `Failed to subscribe channel ${inlineCode(channel.id)} to the following events: ${listInlineCode(
                              failedTypes.map((x) => x[0])
                          )} due to the following reason(s) ${listInlineCode(failedTypes.map((x) => x[1]))}`
                        : ""
                }
            `
        );
    },
};

async function subscribeToLogs(ctx: Client, message: Message, channelId: string, logTypes: LogChannelType[]): Promise<[string[], string[][]]> {
    // Event subscribe handling.
    const failedTypes: string[][] = [];
    const successfulTypes: string[] = [];

    for (const logType of logTypes) {
        if (LogChannelType[logType] && !(await ctx.prisma.logChannel.findFirst({ where: { serverId: message.serverId!, type: LogChannelType[logType] } }))) {
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

    return [successfulTypes, failedTypes];
}

export default Set;
