import { inlineCode } from "@yokilabs/bot";
import { stripIndents } from "common-tags";
import { User, UserType } from "guilded.js";

import { RoleType } from "../../typings";
import { Category, Command } from "../commands";

const Ban: Command = {
    name: "ban",
    description: "Ban the specified user from the server.",
    // usage: "<target> [...reason]",
    examples: ["R40Mp0Wd", "<@R40Mp0Wd> Talking too much about Town of Salem"],
    requiredRole: RoleType.MOD,
    category: Category.Moderation,
    args: [
        {
            name: "target",
            display: "user",
            type: "user",
        },
        {
            name: "reason",
            type: "rest",
            optional: true,
            max: 500,
        },
    ],
    execute: async (message, args, ctx, commandCtx) => {
        const target = args.target as User;
        const reason = args.reason as string | null;

        if (target.type === UserType.Bot) return ctx.messageUtil.replyWithError(message, `Cannot ban bots`, `Bots cannot be banned from the server.`);

        void ctx.amp.logEvent({
            event_type: "BOT_MEMBER_BAN",
            user_id: message.authorId,
            event_properties: { serverId: message.serverId! },
        });
        try {
            await ctx.members.ban(message.serverId!, target.id);
        } catch (e) {
            return ctx.messageUtil.replyWithUnexpected(
                message,
                stripIndents`
                There was an issue banning this user. This is most likely due to misconfigured permissions for your server.
                ${inlineCode((e as Error).message)}
            `,
                undefined,
                { isPrivate: true }
            );
        }

        await ctx.dbUtil.addActionFromMessage(
            message,
            {
                infractionPoints: 10,
                reason,
                targetId: target.id,
                type: "BAN",
                expiresAt: null,
            },
            commandCtx.server
        );

        await ctx.messageUtil.sendSuccessBlock(
            message.channelId,
            `User banned`,
            `<@${message.authorId}>, you have successfully banned ${target.name} (${inlineCode(target.id)}).`,
            undefined,
            {
                isPrivate: true,
            }
        );

        return ctx.messages.delete(message.channelId, message.id);
    },
};

export default Ban;
