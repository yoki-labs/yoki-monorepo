import type { EmbedField } from "@guildedjs/guilded-api-typings";
import { stripIndents } from "common-tags";

import { CachedMember, RoleType } from "../../typings";
import { Category } from "../Category";
import type { Command } from "../Command";

const Warn: Command = {
    name: "warn",
    description: "Warn a user",
    usage: "<targetId> [infraction points] [...reason]",
    requiredRole: RoleType.MOD,
    category: Category.Moderation,
    args: [
        {
            name: "target",
            type: "memberID",
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
        const reasonArg = args.reason as string | null;
        const infractionPointsArg = Number(args.infractionPoints);

        const reason = Number.isNaN(infractionPointsArg) && args.infractionPoints ? `${args.infractionPoints as string} ${reasonArg}`.trimEnd() : reasonArg;
        const infractionPoints = infractionPointsArg || 10;

        try {
            await ctx.messageUtil.sendWarningBlock(
                message.channelId,
                "You have been warned",
                `<@${target.user.id}>, you have been manually warned by a staff member of this server.`,
                {
                    fields: [
                        reason && {
                            name: "Reason",
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
					There was an issue warning this user.
					\`${(e as Error).message}\`
				`,
                undefined,
                { isPrivate: true }
            );
        }

        const newAction = await ctx.dbUtil.addAction({
            serverId: message.serverId!,
            executorId: message.createdBy,
            infractionPoints,
            reason,
            channelId: null,
            triggerContent: null,
            targetId: target.user.id,
            type: "WARN",
            expiresAt: null,
        });

        ctx.emitter.emit("ActionIssued", newAction, target, ctx);

        return ctx.messageUtil.replyWithSuccess(message, `User warned`, `${target.user.name} (\`${target.user.id}\`) has been successfully warned.`, undefined, {
            isPrivate: true,
        });
    },
};

export default Warn;
