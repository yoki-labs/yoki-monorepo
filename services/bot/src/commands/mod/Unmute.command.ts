import type { EmbedField } from "@guildedjs/guilded-api-typings";
import { stripIndents } from "common-tags";

import { CachedMember, RoleType } from "../../typings";
import { inlineCode } from "../../utils/formatters";
import { Category } from "../Category";
import type { Command } from "../Command";
import { Severity } from ".prisma/client";

const Unmute: Command = {
    name: "unmute",
    description: "Removes a mute from the specified user",
    usage: "<targetId> [reason]",
    examples: ["R40Mp0Wd", "R40Mp0Wd Stopped playing Town of Salem"],
    requiredRole: RoleType.MOD,
    category: Category.Moderation,
    aliases: ["unhush", "untimeout", "um"],
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
        if (!commandCtx.server.muteRoleId) return ctx.messageUtil.replyWithAlert(message, `No mute role set`, `There is no mute role configured for this server.`);
        const target = args.target as CachedMember;
        const reason = args.reason as string | null;

        if (target.user.type === "bot") return ctx.messageUtil.replyWithAlert(message, `Cannot unmute bots`, `Bots cannot be unmuted.`);

        try {
            await ctx.rest.router.removeRoleFromMember(message.serverId!, target.user.id, commandCtx.server.muteRoleId);
        } catch (e) {
            return ctx.messageUtil.replyWithError(
                message,
                stripIndents`
					There was an issue removing mute from this user. This is most likely due to misconfigured permissions for your server.
					${inlineCode((e as Error).message)}
				`,
                undefined,
                { isPrivate: true }
            );
        }

        await ctx.prisma.action.updateMany({
            where: {
                type: Severity.MUTE,
                targetId: target.user.id,
                expired: false,
            },
            data: {
                expired: true,
            },
        });

        await ctx.messageUtil.sendInfoBlock(
            message.channelId,
            "You have been unmuted",
            `<@${target.user.id}>, you have been manually unmuted by a staff member of this server.`,
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

        await ctx.messageUtil.sendSuccessBlock(
            message.channelId,
            `User unmuted`,
            `<@${message.createdBy}>, you have successfully unmuted ${target.user.name} (${inlineCode(target.user.id)}).`,
            undefined,
            {
                isPrivate: true,
            }
        );

        return ctx.rest.router.deleteChannelMessage(message.channelId, message.id);
    },
};

export default Unmute;
