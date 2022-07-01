import type { EmbedField } from "@guildedjs/guilded-api-typings";
import { stripIndents } from "common-tags";
import i18next from "i18next";

import { inlineCode } from "../../formatters";
import { CachedMember, RoleType } from "../../typings";
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
        if (!commandCtx.server.muteRoleId) return ctx.messageUtil.replyWithAlert(message, i18next.t("mute.noRoleTitle"), i18next.t("mute.noRoleDescription"));
        const target = args.target as CachedMember;
        const reason = args.reason as string | null;

        try {
            await ctx.rest.router.removeRoleFromMember(message.serverId!, target.user.id, commandCtx.server.muteRoleId);
        } catch (e) {
            return ctx.messageUtil.replyWithError(
                message,
                stripIndents`
					${i18next.t("unmute.error")}
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
            i18next.t("unmute.title"),
            i18next.t("unmute.description", { target }),
            {
                fields: [
                    reason && {
                        name: i18next.t("moderation.reason"),
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
            i18next.t("unmute.targetTitle"),
            i18next.t("unmute.targetDescription", {
                authorId: message.createdBy,
                target,
            }),
            undefined,
            {
                isPrivate: true,
            }
        );

        return ctx.rest.router.deleteChannelMessage(message.channelId, message.id);
    },
};

export default Unmute;
