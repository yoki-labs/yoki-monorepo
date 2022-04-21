import { stripIndents } from "common-tags";
import ms from "ms";

import { LogChannelType, RoleType } from "../../typings";
import type { Command } from "../Command";

const Mute: Command = {
    name: "mute",
    description: "Mute a user.",
    usage: "<targetId> [...reason]",
    requiredRole: RoleType.MOD,
    args: [
        {
            name: "targetId",
            type: "string",
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
        const targetId = args.targetId as string;
        const reason = args.reason as string | null;
        const duration = ms(args.duration as string);
        if (!duration || duration <= 894000) return ctx.messageUtil.send(message.channelId, "Your mute duration must be longer than 15 minutes.");
        const expiresAt = new Date(Date.now() + duration);

        try {
            await ctx.rest.router.assignRoleToMember(message.createdBy, commandCtx.server.muteRoleId);
        } catch (e) {
            return ctx.messageUtil.send(message.channelId, {
                content: stripIndents`
					There was an issue muting this user. This is most likely due to misconfigured permissions for your server.
					\`${(e as Error).message}\`
				`,
                isPrivate: true,
            });
        }

        const newAction = await ctx.serverUtil.addAction({
            serverId: message.serverId!,
            executorId: message.createdBy,
            infractionPoints: 10,
            reason,
            triggerWord: null,
            targetId,
            type: "MUTE",
            expiresAt,
        });

        const modlog = await ctx.serverUtil.getLogChannel(message.serverId!, LogChannelType.MOD_ACTION_LOG);
        if (modlog) await ctx.serverUtil.sendModLogMessage(modlog.channelId, newAction, commandCtx.member);

        return ctx.messageUtil.send(
            message.channelId,
            `User ${commandCtx.member.user.name} (${commandCtx.member.user.id}) has been muted for **${duration / 1000 / 60} minutes** for the reason of \`${
                reason ?? "NO REASON PROVIDED"
            }\`.`
        );
    },
};

export default Mute;
