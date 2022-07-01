import type { EmbedField } from "@guildedjs/guilded-api-typings";
import { stripIndents } from "common-tags";
import i18n from "i18n";

import { inlineCode } from "../../formatters";
import { getInfractionsFrom } from "../../moderation-util";
import { CachedMember, RoleType } from "../../typings";
import { Category } from "../Category";
import type { Command } from "../Command";

const Warn: Command = {
    name: "warn",
    description: "Warn a user",
    usage: "<target's ID> [infraction points] [...reason]",
    requiredRole: RoleType.MOD,
    category: Category.Moderation,
    aliases: ["alert", "w"],
    args: [
        {
            name: "target",
            type: "member",
        },
        {
            name: "infractionPoints",
            type: "string",
            optional: true,
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

        const [reason, infractionPoints] = getInfractionsFrom(args);

        try {
            await ctx.messageUtil.sendWarningBlock(
                message.channelId,
                i18n.__("warn.title"),
                i18n.__("warn.description", target.user.id),
                {
                    fields: [
                        reason && {
                            name: i18n.__("moderation.reason"),
                            value: (reason as string).length > 1021 ? `${(reason as string).substr(0, 1021)}...` : reason,
                        },
                    ].filter(Boolean) as EmbedField[],
                },
                {
                    isPrivate: true,
                }
            );
        } catch (e) {
            return ctx.messageUtil.replyWithError(
                message,
                stripIndents`
					${i18n.__("warn.error")}
					${inlineCode((e as Error).message)}
				`,
                undefined,
                { isPrivate: true }
            );
        }

        await ctx.dbUtil.addActionFromMessage(message, {
            reason,
            infractionPoints,
            targetId: target.user.id,
            type: "WARN",
            expiresAt: null,
        });

        await ctx.messageUtil.sendSuccessBlock(
            message.channelId,
            i18n.__("warn.targetTitle"),
            i18n.__("warn.targetDescription", message.createdBy, target.user.name, inlineCode(target.user.id)),
            undefined,
            {
                isPrivate: true,
            }
        );

        return ctx.rest.router.deleteChannelMessage(message.channelId, message.id);
    },
};

export default Warn;
