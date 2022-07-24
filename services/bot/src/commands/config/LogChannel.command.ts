import Collection from "@discordjs/collection";
// import type { ChatMessagePayload } from "@guildedjs/guilded-api-typings";
// import { stripIndents } from "common-tags";

// import type Client from "../../Client";
// import { inlineCode, listInlineCode } from "../../formatters";
import { /* LogChannel as LogChannelPrisma, LogChannelType */ RoleType } from "../../typings";
import { Category } from "../Category";
import type { Command } from "../Command";
import Types from "./logchannel/Types.command";
import List from "./logchannel/List.command";
import Set from "./logchannel/Set.command";
import Remove from "./logchannel/Remove.command";

// function cleanupChannels(logChannels: LogChannelPrisma[]) {
//     const channels = new Collection<string, LogChannelType[]>();
//
//     logChannels.forEach((channel) => {
//         if (channels.has(channel.channelId)) {
//             channels.get(channel.channelId)?.push(channel.type);
//         } else {
//             const newArray: LogChannelType[] = [channel.type];
//             channels.set(channel.channelId, newArray);
//         }
//     });
//
//     return channels;
// }

// // With the ability to remove it
// const LogChannelArgs = Object.assign({}, LogChannelType, { REMOVE: "REMOVE" });
//
// type LogChannelArgEnum = keyof typeof LogChannelArgs;

const subCommands = new Collection<string, Command>().set("types", Types).set("list", List).set("set", Set).set("remove", Remove);

const LogChannel: Command = {
    name: "config-logchannel",
    subName: "logchannel",
    category: Category.Settings,
    description: "Manage your log channel's.",
    aliases: ["logs"],
    parentCommand: true,
    requiredRole: RoleType.ADMIN,
    devOnly: true,
    subCommands,
    execute: () => void 0,
};

// const LogChannel: Command = {
//     name: "config-logchannel",
//     description: "Set or view whether message updates are logged to the mod log channel.",
//     usage: "[channelId] [log type | log type | log type]",
//     examples: ["channel_id all", "channel_id chat_message_update | chat_message_delete", "channel_id remove", "channel_id chat_message_update | remove"],
//     subCommand: true,
//     subName: "logchannel",
//     category: Category.Settings,
//     requiredRole: RoleType.ADMIN,
//     args: [
//         { name: "channelId", type: "UUID", optional: true },
//         { name: "logTypes", optional: true, type: "enumList", values: LogChannelArgs },
//     ],
//     execute: async (message, args, ctx) => {
//         const channelId = args.channelId as string;
//         let logTypes = args.logTypes as LogChannelArgEnum[] | null;
//
//         // If the user didn't supply a channelId. Get all log channels, use above cleanup method to filter duplicates and merge them, then list them.
//         if (!channelId || !logTypes) return replyWithChannelList(message, ctx);
//
//         const channel = await ctx.rest.router.getChannel(channelId).catch(() => null);
//         if (!channel)
//             return ctx.messageUtil.replyWithAlert(
//                 message,
//                 "Sorry! That is not a valid channel!",
//                 "Please ensure that the provided ID belongs to a channel that I can see! I also require `MANAGE CHANNEL` permissions to be able to grab that channel!"
//             );
//
//         // If there are logTypes, uppercase them all, then filter out duplicates. No idea why this had to specifically be two different lines.
//         if (logTypes.length > 0) {
//             logTypes = logTypes.filter((value, index) => logTypes!.indexOf(value) === index);
//         }
//
//         // If there aren't any logTypes or logTypes contains "ALL" default the entire list to ALL for optimization.
//         if (logTypes.includes("REMOVE")) {
//             // Unspecified means unsubscribe from all
//             const toUnsubscribeFrom = logTypes.length === 1 ? undefined : { in: logTypes.filter((x) => x !== "REMOVE") as LogChannelType[] };
//
//             await ctx.prisma.logChannel.deleteMany({
//                 where: {
//                     channelId,
//                     serverId: message.serverId!,
//                     type: toUnsubscribeFrom,
//                 },
//             });
//
//             return ctx.messageUtil.replyWithSuccess(
//                 message,
//                 `Unsubscribed`,
//                 toUnsubscribeFrom
//                     ? `Following events were unsubscribed from the channel ${inlineCode(channelId)}: ${toUnsubscribeFrom.in.map((x) => inlineCode(x)).join(", ")}`
//                     : `All events were unsubscribed from the channel ${inlineCode(channelId)}.`
//             );
//         } else if (logTypes.length === 0 || logTypes.includes("ALL")) {
//             logTypes = ["ALL"];
//         }
//
//         const [successfulTypes, failedTypes] = await subscribeToLogs(ctx, message, channelId, logTypes as LogChannelType[]);
//
//         // Reply to the command, with the successful and failed types.
//         return ctx.messageUtil[successfulTypes.length > 0 ? "replyWithSuccess" : "replyWithAlert"](
//             message,
//             successfulTypes.length > 0 ? `Subscriptions added` : `No subscriptions added`,
//             stripIndents`
//                 ${successfulTypes.length > 0 ? `Successfully subscribed channel ${inlineCode(channelId)} to the following events: ${listInlineCode(successfulTypes)}` : ""}
//                 ${
//                     failedTypes.length > 0
//                         ? `Failed to subscribe channel ${inlineCode(channelId)} to the following events: ${listInlineCode(
//                               failedTypes.map((x) => x[0])
//                           )} due to the following reason(s) ${listInlineCode(failedTypes.map((x) => x[1]))}`
//                         : ""
//                 }
//             `
//         );
//     },
// };

// async function subscribeToLogs(ctx: Client, message: ChatMessagePayload, channelId: string, logTypes: LogChannelType[]): Promise<[string[], string[][]]> {
//     // Event subscribe handling.
//     const failedTypes: string[][] = [];
//     const successfulTypes: string[] = [];
//
//     // If the channel's already subscribed to all events.
//     // Else, loop through all logTypes, if it's a valid LogChannelType, and doesn't already exist, go ahead and subscribe.
//
//     // If it's successfully added, add the logType to the successfulTypes array.
//     // Else, add it to the failedTypes array, with a reason. `TYPE:ERROR`
//     /* if (await ctx.prisma.logChannel.findFirst({ where: { serverId: message.serverId, type: LogChannelType.ALL } })) {
//         failedTypes.push(`SERVER_ALREADY_SUBSCRIBED_TO_ALL`);
//     } else {*/
//     for (const logType of logTypes) {
//         if (LogChannelType[logType] && !(await ctx.prisma.logChannel.findFirst({ where: { serverId: message.serverId, type: LogChannelType[logType] } }))) {
//             try {
//                 await ctx.prisma.logChannel.create({ data: { channelId, serverId: message.serverId!, type: LogChannelType[logType] } });
//                 successfulTypes.push(logType);
//             } catch (e) {
//                 failedTypes.push([logType, "INTERNAL_ERROR"]);
//             }
//         } else {
//             failedTypes.push([logType, LogChannelType[logType] ? `MAX_1_REACHED` : "INVALID_LOG_TYPE"]);
//         }
//     }
//     // }
//     return [successfulTypes, failedTypes];
// }
//
// // Gives channel list or nothing
// async function replyWithChannelList(message: ChatMessagePayload, ctx: Client) {
//     const logChannels = await ctx.dbUtil.getLogChannels(message.serverId!);
//     if (logChannels.length <= 0)
//         return ctx.messageUtil.replyWithNullState(
//             message,
//             `No log channels`,
//             stripIndents`
//                 There are no log channels set for this server.
//                 You can set the following types: ${listInlineCode(Object.values(LogChannelType))}
//             `
//         );
//
//     const formattedChannels: Collection<string, LogChannelType[]> = await cleanupChannels(logChannels);
//
//     return ctx.messageUtil.replyWithInfo(
//         message,
//         `Log channels`,
//         stripIndents`
//             This server has the following log channels:
//             ${formattedChannels.map((v, k) => `***${k}:*** ${listInlineCode(v)}`).join("\n")}
//         `
//     );
// }

export default LogChannel;
