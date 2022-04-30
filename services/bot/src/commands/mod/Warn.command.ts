import { stripIndents } from "common-tags";

import { CachedMember, RoleType } from "../../typings";
import { Category } from "../Category";
import type { Command } from "../Command";

const Warn: Command = {
    name: "warn",
    description: "Warn a user",
    usage: "<targetId> [...reason]",
    requiredRole: RoleType.MOD,
    category: Category.Moderation,
    args: [
        {
            name: "target",
            type: "memberID",
        },
        {
            name: "reason",
            type: "rest",
        },
    ],
    execute: async (message, args, ctx) => {
        const target = args.target as CachedMember;
        const reason = args.reason as string | null;

        try {
            await ctx.messageUtil.send(message.channelId, {
                content: `**Alert!** ${target.user.name}, you have been warned for \`${reason}\`. 
				Please re-read the rules for this server and ensure this behavior does not repeat`,
            });
        } catch (e) {
            return ctx.messageUtil.send(message.channelId, {
                content: stripIndents`
					There was an issue warning this user.
					\`${(e as Error).message}\`
				`,
                isPrivate: true,
                replyMessageIds: [message.id],
            });
        }

        const newAction = await ctx.dbUtil.addAction({
            serverId: message.serverId!,
            executorId: message.createdBy,
            infractionPoints: 10,
            reason,
            triggerContent: null,
            targetId: target.user.id,
            type: "WARN",
            expiresAt: null,
        });

        ctx.emitter.emit("ActionIssued", newAction, target, ctx);

        return ctx.messageUtil.send(message.channelId, {
            content: `User ${target.user.name} (${target.user.id}) has been warned for the reason of \`${reason}\``,
            replyMessageIds: [message.id],
            isPrivate: true,
        });
    },
};

export default Warn;
