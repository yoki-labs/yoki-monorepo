import { stripIndents } from "common-tags";
import ms from "ms";

import { CachedMember, RoleType } from "../../typings";
import { Category } from "../Category";
import type { Command } from "../Command";

const Mute: Command = {
    name: "mute",
    description: "Mute a user for a specified amount of time (ex. 3h, 30m, 5d)",
    usage: "<targetId> <time> [...reason]",
    requiredRole: RoleType.MOD,
    category: Category.Moderation,
    args: [
        {
            name: "target",
            type: "memberID",
        },
        {
            name: "duration",
            type: "string",
        },
        {
            name: "reason",
            type: "rest",
            optional: true,
        },
    ],
    execute: async (message, args, ctx, commandCtx) => {
        if (!commandCtx.server.muteRoleId) return ctx.messageUtil.send(message.channelId, "There is no mute role configured for this server.");
        const target = args.target as CachedMember;
        const reason = args.reason as string | null;
        const duration = ms(args.duration as string);
        if (!duration || duration <= 894000) return ctx.messageUtil.send(message.channelId, "Your mute duration must be longer than 15 minutes.");
        const expiresAt = new Date(Date.now() + duration);

        try {
            await ctx.rest.router.assignRoleToMember(message.serverId!, target.user.id, commandCtx.server.muteRoleId);
        } catch (e) {
            return ctx.messageUtil.send(message.channelId, {
                content: stripIndents`
					There was an issue muting this user. This is most likely due to misconfigured permissions for your server.
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
            type: "MUTE",
            expiresAt,
        });
        ctx.emitter.emit("ActionIssued", newAction, target, ctx);

        return ctx.messageUtil.send(
            message.channelId,
            `User ${target.user.name} (${target.user.id}) has been muted for **${duration / 1000 / 60} minutes** for the reason of \`${reason ?? "NO REASON PROVIDED"}\`.`
        );
    },
};

export default Mute;
