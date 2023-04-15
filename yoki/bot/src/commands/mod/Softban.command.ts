import { inlineCode } from "@yokilabs/util";
import { stripIndents } from "common-tags";
import { UserType } from "guilded.js";

import { CachedMember, RoleType } from "../../typings";
import { Category, Command } from "../commands";

const Ban: Command = {
    name: "softban",
    description: "Kick the member and clear their messages.",
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

        if (target.user!.type === UserType.Bot) return ctx.messageUtil.replyWithError(message, `Cannot soft ban bots`, `Bots cannot be soft banned from the server.`);

        void ctx.amp.logEvent({
            event_type: "BOT_MEMBER_SOFTBAN",
            user_id: message.authorId,
            event_properties: { serverId: message.serverId! },
        });
        try {
            await ctx.members.ban(message.serverId!, target.user!.id);
            await ctx.bans.unban(message.serverId!, target.user!.id);
        } catch (e) {
            return ctx.messageUtil.replyWithUnexpected(
                message,
                stripIndents`
                There was an issue soft banning this user. This is most likely due to misconfigured permissions for your server.
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
                targetId: target.user!.id,
                type: "SOFTBAN",
                expiresAt: null,
            },
            commandCtx.server
        );

        await ctx.messageUtil.sendSuccessBlock(
            message.channelId,
            `User soft banned`,
            `<@${message.authorId}>, you have successfully kicked and cleared ${target.user!.name}'s (${inlineCode(target.user!.id)}) content.`,
            undefined,
            {
                isPrivate: true,
            }
        );

        return ctx.messages.delete(message.channelId, message.id);
    },
};

export default Ban;
