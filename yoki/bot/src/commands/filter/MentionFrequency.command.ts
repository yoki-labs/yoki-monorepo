import { inlineCode } from "@yokilabs/bot";

import { RoleType } from "../../typings";
import { Category, Command } from "../commands";

const MentionSpamFrequency: Command = {
    name: "filter-mentionfrequency",
    description: "Set the required count of mentions per 5 seconds to filter.",
    // usage: "[mentions per 5 secs]",
    examples: ["5"],
    subCommand: true,
    category: Category.Settings,
    subName: "mentionfrequency",
    requiredRole: RoleType.ADMIN,
    args: [{ name: "frequency", display: "mentions per 5 secs", optional: true, type: "number" }],
    execute: async (message, args, ctx, { server }) => {
        const frequency = args.frequency as number | null;

        if (frequency === null)
            return ctx.messageUtil.replyWithInfo(
                message,
                `Mention spam frequency`,
                `Mention spam frequency has been set to ${inlineCode(server.spamMentionFrequency)} mentions per 5 seconds.`
            );
        // Cannot make people auto-muted over 1 message
        if (frequency < 2)
            return ctx.messageUtil.replyWithError(
                message,
                `Mention frequency cannot be zero`,
                `You cannot set mention spam frequency to \`0\` or \`1\`. If you want to disable mention spamming, please disable filtering.`
            );

        await ctx.prisma.server.updateMany({ data: { spamMentionFrequency: frequency }, where: { serverId: message.serverId! } });
        return ctx.messageUtil.replyWithSuccess(
            message,
            `Mention spam frequency changed`,
            `Mention spam filter will now go off if someone sends ${inlineCode(frequency)} mentions per 5 seconds.`
        );
    },
};

export default MentionSpamFrequency;
