import { LogChannelType } from "@prisma/client";
import { stripIndents } from "common-tags";

import { Colors } from "../utils/color";
import { inlineCode } from "../utils/formatters";
import { Category } from "./Category";
import type { Command } from "./Command";

const nonPrivateLogs: LogChannelType[] = [LogChannelType.message_edits, LogChannelType.message_deletions, LogChannelType.topic_edits, LogChannelType.topic_deletions, LogChannelType.comment_deletions];
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

const formatNoIssue = (log: LogChannelType) => `:white_check_mark: **Doesn't have ${inlineCode(log)} logging.**`;
const formatPrivacyIssue = (log: LogChannelType) => `:x: **Has ${inlineCode(log)} logging.**`;

export default Privacy;
