import { Collection } from "@discordjs/collection";

import { LogChannelType, RoleType } from "../../typings";
import { Category, Command } from "../commands";

const categorizedLogs: Collection<string, LogChannelType[]> = new Collection<string, LogChannelType[]>()
    .set("Content", [
        LogChannelType.message_edits,
        LogChannelType.message_deletions,
        LogChannelType.topic_edits,
        LogChannelType.topic_locks,
        LogChannelType.topic_deletions,
        LogChannelType.comment_deletions,
    ])
    .set("Server", [LogChannelType.channel_creations, LogChannelType.channel_deletions, LogChannelType.role_creations, LogChannelType.role_deletions])
    .set("Members", [LogChannelType.member_joins, LogChannelType.member_leaves, LogChannelType.member_bans, LogChannelType.member_updates, LogChannelType.member_roles_updates])
    .set("Yoki Moderation", [LogChannelType.mod_actions, LogChannelType.modmail_logs])
    .set("Misc", [LogChannelType.all, LogChannelType.notifications]);

const Types: Command = {
    name: "logs-types",
    description: "List all possible log types.",
    // usage: "",
    subCommand: true,
    category: Category.Settings,
    subName: "types",
    requiredRole: RoleType.ADMIN,
    execute: (message, _args, ctx, { prefix }) => {
        return ctx.messageUtil.replyWithCategorizedList(
            message,
            `Log channel types`,
            categorizedLogs,
            `To add a log channel, type \`${prefix}logs set [channel here] [log type here]\``
        );
    },
};

export default Types;
