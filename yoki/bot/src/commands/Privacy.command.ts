import { LogChannelType } from "@prisma/client";
import { Colors, inlineCode } from "@yokilabs/util";
import { stripIndents } from "common-tags";

import { Category, Command } from "./commands";

// Kind of spellchecker
type UnprivateLogChannelType = Extract<LogChannelType, "message_edits" | "message_deletions" | "topic_edits" | "topic_deletions" | "comment_deletions" | "member_updates">;

const nonPrivateLogDescriptions: Record<UnprivateLogChannelType, string> = {
    [LogChannelType.message_edits]: "New and old contents of an edited message will be shown in the mod logs.",
    [LogChannelType.message_deletions]: "Deleted messages and their previous content will be shown in the mod logs.",
    [LogChannelType.topic_edits]: "New and old contents of an edited forum topic will be shown in the mod logs.",
    [LogChannelType.topic_deletions]: "Deleted forum topics and their previous content will be shown in the mod logs.",
    [LogChannelType.comment_deletions]: "Deleted forum topic comments and their previous content will be shown in the mod logs.",
    [LogChannelType.member_updates]: "Nicknames changes with old nickname and new nickname will be shown in the mod logs.",
};

const nonPrivateLogs: LogChannelType[] = Object.keys(nonPrivateLogDescriptions) as LogChannelType[];

const possibleNonPrivateLogs = nonPrivateLogs.concat(LogChannelType.all);

const Privacy: Command = {
    name: "privacy",
    description: "Gives the information in a private message about server's privacy on your content.",
    usage: "",
    aliases: ["pr", "privacyreport"],
    category: Category.Logs,
    execute: async (message, _args, ctx) => {
        await ctx.messages.delete(message.channelId, message.id);

        const channels: LogChannelType[] = (await ctx.dbUtil.getMultipleLogChannels(message.serverId!, possibleNonPrivateLogs)).map((x) => x.type);

        // Which logs exist and which don't
        const [localPrivacyIssue, localNoIssue] = channels.includes(LogChannelType.all)
            ? [nonPrivateLogs, []]
            : [nonPrivateLogs.filter((x) => channels.includes(x)), nonPrivateLogs.filter((x) => !channels.includes(x))];

        const color =
            // No unprivate logs
            localNoIssue.length === nonPrivateLogs.length
                ? Colors.green
                : // Has all of the unprivate logs
                localPrivacyIssue.length === nonPrivateLogs.length
                ? Colors.red
                : // Half or more of the unprivate logs are missing
                localNoIssue.length > nonPrivateLogs.length / 2
                ? Colors.yellow
                : // Half or more than half of unprivate logs are there
                  Colors.orangeRed;

        return ctx.messageUtil.sendEmbed(
            message.channelId,
            {
                title: "Server's Content Privacy",
                description: stripIndents`
                <@${message.authorId}>, here's a report about server's content privacy:
                ${localNoIssue.map(formatNoIssue).join("\n")}
                ${localPrivacyIssue.map(formatPrivacyIssue).join("\n")}
            `,
                color,
            },
            { isPrivate: true }
        );
    },
};

const formatNoIssue = (log: LogChannelType) => `:large_green_circle: **Doesn't have ${inlineCode(log)} logging.**`;
const formatPrivacyIssue = (log: LogChannelType) => `:red_circle: **Has ${inlineCode(log)} logging.**\n${nonPrivateLogDescriptions[log]}`;

export default Privacy;
