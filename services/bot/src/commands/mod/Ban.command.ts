import { stripIndents } from "common-tags";
import i18next from "i18next";

import { inlineCode } from "../../formatters";
import { CachedMember, RoleType } from "../../typings";
import { Category } from "../Category";
import type { Command } from "../Command";

const Ban: Command = {
    name: "ban",
    description: "Ban a user",
    usage: "<targetId> [...reason]",
    examples: ["R40Mp0Wd", "R40Mp0Wd Talking too much about Town of Salem"],
    requiredRole: RoleType.MOD,
    category: Category.Moderation,
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
    execute: async (message, args, ctx) => {
        const target = args.target as CachedMember;
        const reason = args.reason as string | null;

        try {
            await ctx.rest.router.banMember(message.serverId!, target.user.id);
        } catch (e) {
            return ctx.messageUtil.replyWithError(
                message,
                stripIndents`
					${i18next.t("ban.error")}
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
            type: "BAN",
            expiresAt: null,
        });

        await ctx.messageUtil.sendSuccessBlock(
            message.channelId,
            i18next.t("ban.targetTitle"),
            i18next.t("ban.targetDescription", {
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

export default Ban;
