import Embed from "@guildedjs/embeds";
import type { APIEmbedField } from "@guildedjs/guilded-api-typings";
import { stripIndents } from "common-tags";
import ms from "ms";

import { RoleType } from "../../typings";
import { isHashId } from "../../util";
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
        const member = await ctx.serverUtil.getMember(message.serverId!, targetId);
        if (!member)
            return ctx.messageUtil.send(message.channelId, {
                content: stripIndents`
                    That is not a valid user ID.
                `,
                replyMessageIds: [message.id],
            });
        const reason = args.reason as string | null;
        const duration = ms(args.duration as string);
        if (!duration || duration <= 894000) return ctx.messageUtil.send(message.channelId, "Your mute duration must be longer than 15 minutes.");
        const expiresAt = new Date(Date.now() + duration);

        if (!isHashId(targetId))
            return ctx.messageUtil.send(message.channelId, {
                content: stripIndents`
                    Please provide the identifier of the user as \`targetId\`
                `,
                replyMessageIds: [message.id],
            });

        try {
            await ctx.rest.router.assignRoleToMember(message.serverId!, targetId, commandCtx.server.muteRoleId);
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

        await ctx.serverUtil.sendModLogMessageIfPossible(message.serverId!, commandCtx.member, newAction);

        return ctx.messageUtil.send(message.channelId, {
            content: "Mute has been received",
            isPrivate: true,
            embeds: [
                new Embed({
                    title: ":mute: You have been muted",
                    description: `<@${targetId}>, you have been muted for **${duration / 60000}** minutes.`,
                    color: ctx.messageUtil.colors.bad,
                    fields: [
                        reason && {
                            name: "Reason",
                            value: (reason as string).length > 1024 ? `${reason.substr(0, 1021)}...` : reason,
                        },
                    ].filter(Boolean) as APIEmbedField[],
                }),
            ],
        });
    },
};

export default Mute;
