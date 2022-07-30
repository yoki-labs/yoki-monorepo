import type { EmbedField } from "@guildedjs/guilded-api-typings";
import { stripIndents } from "common-tags";
import ms from "ms";

import { CachedMember, RoleType } from "../../typings";
import { Colors } from "../../utils/color";
import { bold, inlineCode } from "../../utils/formatters";
import { Category } from "../Category";
import type { Command } from "../Command";

const Mute: Command = {
    name: "mute",
    description: "Mute a user for a specified amount of time (ex. 3h, 30m, 5d)",
    usage: "<targetId> <time> [...reason]",
    examples: ["R40Mp0Wd 25m", "R40Mp0Wd 1h Talking too much about Town of Salem"],
    requiredRole: RoleType.MOD,
    category: Category.Moderation,
    aliases: ["hush", "timeout", "m"],
    args: [
        {
            name: "target",
            type: "member",
        },
        {
            name: "duration",
            type: "string",
        },
        {
            name: "reason",
            type: "rest",
            optional: true,
            max: 500,
        },
    ],
    execute: async (message, args, ctx, commandCtx) => {
        if (!commandCtx.server.muteRoleId) return ctx.messageUtil.replyWithAlert(message, `No mute role set`, `There is no mute role configured for this server.`);
        const target = args.target as CachedMember;
        const reason = args.reason as string | null;
        const duration = ms(args.duration as string);
        if (!duration || duration <= 894000) return ctx.messageUtil.replyWithAlert(message, `Duration must be longer`, `Your mute duration must be longer than 15 minutes.`);
        const expiresAt = new Date(Date.now() + duration);

        try {
            await ctx.rest.router.assignRoleToMember(message.serverId!, target.user.id, commandCtx.server.muteRoleId);
        } catch (e) {
            return ctx.messageUtil.replyWithError(
                message,
                stripIndents`
					There was an issue muting this user. This is most likely due to misconfigured permissions for your server.
					${inlineCode((e as Error).message)}
				`,
                undefined,
                { isPrivate: true }
            );
        }

        // We don't need history for bots
        if (target.user.type !== "bot") {
            await ctx.dbUtil.addActionFromMessage(message, {
                infractionPoints: 10,
                reason,
                targetId: target.user.id,
                type: "MUTE",
                expiresAt,
            });

            await ctx.messageUtil.sendValueBlock(
                message.channelId,
                ":mute: You have been muted",
                `<@${target.user.id}>, you have been muted for ${bold(duration / 60000)} minutes.`,
                Colors.red,
                {
                    fields: [
                        reason && {
                            name: "Reason",
                            value: (reason as string).length > 1024 ? `${reason.substr(0, 1021)}...` : reason,
                        },
                    ].filter(Boolean) as EmbedField[],
                },
                {
                    isPrivate: true,
                }
            );
        }

        await ctx.messageUtil.sendSuccessBlock(
            message.channelId,
            `User muted`,
            `<@${message.createdBy}>, you have successfully muted ${target.user.name} (${inlineCode(target.user.id)}).`,
            undefined,
            {
                isPrivate: true,
            }
        );

        return ctx.rest.router.deleteChannelMessage(message.channelId, message.id);
    },
};

export default Mute;
