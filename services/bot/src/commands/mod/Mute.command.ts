import type { EmbedField } from "@guildedjs/guilded-api-typings";
import { stripIndents } from "common-tags";
import i18n from "i18n";
import ms from "ms";

import { Colors } from "../../color";
import { bold, inlineCode } from "../../formatters";
import { CachedMember, RoleType } from "../../typings";
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
        if (!commandCtx.server.muteRoleId) return ctx.messageUtil.replyWithAlert(message, i18n.__("mute.noRoleTitle"), i18n.__("mute.noRoleDescription"));
        const target = args.target as CachedMember;
        const reason = args.reason as string | null;
        const duration = ms(args.duration as string);
        if (!duration || duration <= 894000) return ctx.messageUtil.replyWithAlert(message, i18n.__("mute.badDurationTitle"), i18n.__("mute.badDurationDescription"));
        const expiresAt = new Date(Date.now() + duration);

        try {
            await ctx.rest.router.assignRoleToMember(message.serverId!, target.user.id, commandCtx.server.muteRoleId);
        } catch (e) {
            return ctx.messageUtil.replyWithError(
                message,
                stripIndents`
					${i18n.__("mute.error")}
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
            type: "MUTE",
            expiresAt,
        });

        await ctx.messageUtil.sendValueBlock(
            message.channelId,
            i18n.__("mute.title"),
            i18n.__("mute.description", target.user.id, bold(duration / 60000)),
            Colors.red,
            {
                fields: [
                    reason && {
                        name: i18n.__("moderation.reason"),
                        value: (reason as string).length > 1024 ? `${reason.substr(0, 1021)}...` : reason,
                    },
                ].filter(Boolean) as EmbedField[],
            },
            {
                isPrivate: true,
            }
        );

        await ctx.messageUtil.sendSuccessBlock(
            message.channelId,
            i18n.__("mute.targetTitle"),
            i18n.__("mute.targetDescription", message.createdBy, target.user.name, inlineCode(target.user.id)),
            undefined,
            {
                isPrivate: true,
            }
        );

        return ctx.rest.router.deleteChannelMessage(message.channelId, message.id);
    },
};

export default Mute;
