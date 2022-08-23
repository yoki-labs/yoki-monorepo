import { stripIndents } from "common-tags";

import { CachedMember, RoleType } from "../../typings";
import { inlineCode } from "../../utils/formatters";
import { Category } from "../Category";
import type { Command } from "../Command";

const Kick: Command = {
    name: "kick",
    description: "Kick a user",
    usage: "<targetId> [...reason]",
    examples: ["R40Mp0Wd", "R40Mp0Wd Talking too much about Town of Salem"],
    requiredRole: RoleType.MOD,
    category: Category.Moderation,
    args: [
        {
            name: "target",
            type: "member",
        },
        {
            name: "reason",
            type: "rest",
            optional: true,
            max: 500,
        },
    ],
    execute: async (message, args, ctx) => {
        const target = args.target as CachedMember;
        const reason = args.reason as string | null;

        void ctx.amp.logEvent({
            event_type: "BOT_MEMBER_KICK",
            user_id: message.createdBy,
            event_properties: { serverId: message.serverId },
        });
        try {
            await ctx.rest.router.kickMember(message.serverId!, target.user.id);
        } catch (e) {
            return ctx.messageUtil.replyWithError(
                message,
                stripIndents`
					There was an issue kicking this user. This is most likely due to misconfigured permissions for your server.
					${inlineCode((e as Error).message)}
				`,
                undefined,
                { isPrivate: true }
            );
        }

        // Don't need a history for bots
        if (target.user.type !== "bot")
            await ctx.dbUtil.addActionFromMessage(message, {
                infractionPoints: 10,
                reason,
                targetId: target.user.id,
                type: "KICK",
                expiresAt: null,
            });

        await ctx.messageUtil.sendSuccessBlock(
            message.channelId,
            `User kicked`,
            `<@${message.createdBy}>, you have successfully kicked ${target.user.name} (${inlineCode(target.user.id)}).`,
            undefined,
            {
                isPrivate: true,
            }
        );

        return ctx.rest.router.deleteChannelMessage(message.channelId, message.id);
    },
};

export default Kick;
