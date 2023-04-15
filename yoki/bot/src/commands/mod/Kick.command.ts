import { inlineCode } from "@yokilabs/util";
import { stripIndents } from "common-tags";
import { UserType } from "guilded.js";

import { CachedMember, RoleType } from "../../typings";
import { Category, Command } from "../commands";

const Kick: Command = {
    name: "kick",
    description: "Kick a user.",
    usage: "<target> [...reason]",
    examples: ["R40Mp0Wd", "<@R40Mp0Wd> Talking too much about Town of Salem"],
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
    execute: async (message, args, ctx, commandCtx) => {
        const target = args.target as CachedMember;
        const reason = args.reason as string | null;

        void ctx.amp.logEvent({
            event_type: "BOT_MEMBER_KICK",
            user_id: message.authorId,
            event_properties: { serverId: message.serverId! },
        });
        try {
            await ctx.members.kick(message.serverId!, target.user!.id);
        } catch (e) {
            return ctx.messageUtil.replyWithUnexpected(
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
        if (target.user!.type !== UserType.Bot)
            await ctx.dbUtil.addActionFromMessage(
                message,
                {
                    infractionPoints: 10,
                    reason,
                    targetId: target.user!.id,
                    type: "KICK",
                    expiresAt: null,
                },
                commandCtx.server
            );

        await ctx.messageUtil.sendSuccessBlock(
            message.channelId,
            `User kicked`,
            `<@${message.authorId}>, you have successfully kicked ${target.user!.name} (${inlineCode(target.user!.id)}).`,
            undefined,
            {
                isPrivate: true,
            }
        );

        return ctx.messages.delete(message.channelId, message.id);
    },
};

export default Kick;
