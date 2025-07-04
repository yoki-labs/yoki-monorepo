import { inlineCode } from "@yokilabs/bot";

import { RoleType } from "../../typings";
import { Category, Command } from "../commands";

const SpamFrequency: Command = {
    name: "filter-spamfrequency",
    description: "Set the required count of messages to be filtered as spam.",
    // usage: "[messages per 5 secs]",
    examples: ["9"],
    subCommand: true,
    category: Category.Settings,
    subName: "spamfrequency",
    requiredRole: RoleType.ADMIN,
    args: [{ name: "frequency", display: "messages per 5 secs", optional: true, type: "number" }],
    execute: async (message, args, ctx, { server }) => {
        const frequency = args.frequency as number | null;

        if (frequency === null)
            return ctx.messageUtil.replyWithInfo(message, `Spam frequency`, `Spam frequency has been set to ${inlineCode(server.spamFrequency)} messages per 5 seconds.`);
        // Cannot make people auto-muted over 1 message
        if (frequency < 2)
            return ctx.messageUtil.replyWithError(
                message,
                `Spam frequency cannot be zero`,
                `You cannot set spam frequency to \`0\` or \`1\`. If you want to disable spamming, please disable filtering.`
            );

        await ctx.prisma.server.updateMany({ data: { spamFrequency: frequency }, where: { serverId: message.serverId! } });
        return ctx.messageUtil.replyWithSuccess(message, `Spam frequency changed`, `Spam filter will now go off if someone sends ${inlineCode(frequency)} messages per 5 seconds.`);
    },
};

export default SpamFrequency;
