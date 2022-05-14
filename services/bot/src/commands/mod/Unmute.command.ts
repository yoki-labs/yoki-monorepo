import type { APIEmbedField } from "@guildedjs/guilded-api-typings";
import { stripIndents } from "common-tags";

import { inlineCodeblock } from "../../formatters";
import { CachedMember, RoleType } from "../../typings";
import { Category } from "../Category";
import type { Command } from "../Command";
import { Severity } from ".prisma/client";

const Unmute: Command = {
    name: "unmute",
    description: "Removes a mute from the specified user",
    usage: "<targetId>",
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
    execute: async (message, args, ctx, commandCtx) => {
        if (!commandCtx.server.muteRoleId) return ctx.messageUtil.replyWithAlert(message, `No mute role set`, `There is no mute role configured for this server.`);
        const target = args.target as CachedMember;
        const reason = args.reason as string | null;

        try {
            await ctx.rest.router.removeRoleFromMember(message.serverId!, target.user.id, commandCtx.server.muteRoleId);
        } catch (e) {
            return ctx.messageUtil.replyWithError(
                message,
                stripIndents`
					There was an issue removing mute from this user. This is most likely due to misconfigured permissions for your server.
					\`${(e as Error).message}\`
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
                ].filter(Boolean) as APIEmbedField[],
            },
            {
                isPrivate: true,
            }
        );

        return ctx.messageUtil.replyWithSuccess(message, `User unmuted`, `${target.user.name} (${inlineCodeblock(target.user.id)}) has been unmuted successfully.`, undefined, {
            isPrivate: true,
        });
    },
};

export default Unmute;
