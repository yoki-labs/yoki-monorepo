import { stripIndents } from "common-tags";

import { inlineCode } from "../../formatters";
import { CachedMember, RoleType } from "../../typings";
import { Category } from "../Category";
import type { Command } from "../Command";

const Ban: Command = {
    name: "ban",
    description: "Ban a user",
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

        if (target.user.type === "bot") return ctx.messageUtil.replyWithAlert(message, `Cannot ban bots`, `Bots cannot be banned from the server.`);

        try {
            await ctx.rest.router.banMember(message.serverId!, target.user.id);
        } catch (e) {
            return ctx.messageUtil.replyWithError(
                message,
                stripIndents`
                There was an issue banning this user. This is most likely due to misconfigured permissions for your server.
                ${inlineCode((e as Error).message)}
            `,
                undefined,
                { isPrivate: true }
            );
        }

        await ctx.dbUtil.addActionFromMessage(message, {
            infractionPoints: 10,
            reason,
            targetId: target.user.id,
            type: "BAN",
            expiresAt: null,
        });

        await ctx.messageUtil.sendSuccessBlock(
            message.channelId,
            `User banned`,
            `<@${message.createdBy}>, you have successfully banned ${target.user.name} (${inlineCode(target.user.id)}).`,
            undefined,
            {
                isPrivate: true,
            }
        );

        return ctx.rest.router.deleteChannelMessage(message.channelId, message.id);
    },
};

export default Ban;
