import type { APIEmbedField } from "@guildedjs/guilded-api-typings";
import { stripIndents } from "common-tags";

import { CachedMember, RoleType } from "../../typings";
import { Category } from "../Category";
import type { Command } from "../Command";

const Warn: Command = {
    name: "warn",
    description: "Warn a user",
    usage: "<targetId> [...reason]",
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
    execute: async (message, args, ctx) => {
        const target = args.target as CachedMember;
        const reason = args.reason as string | null;

        try {
            await ctx.messageUtil.send(message.channelId, {
                isPrivate: true,
                embeds: [
                    {
                        title: ":warning: You have been warned",
                        color: ctx.messageUtil.colors.warn,
                        description: `<@${target.user.id}>, you have been manually warned by a staff member of this server.`,
                        fields: [
                            reason && {
                                name: "Reason",
                                value: (reason as string).length > 1021 ? `${(reason as string).substr(0, 1021)}...` : reason,
                            },
                        ].filter(Boolean) as APIEmbedField[],
                    },
                ],
            });
        } catch (e) {
            return ctx.messageUtil.send(message.channelId, {
                content: stripIndents`
					There was an issue warning this user.
					\`${(e as Error).message}\`
				`,
                isPrivate: true,
                replyMessageIds: [message.id],
            });
        }

        const newAction = await ctx.dbUtil.addAction({
            serverId: message.serverId!,
            executorId: message.createdBy,
            infractionPoints: 10,
            reason,
            triggerContent: null,
            targetId: target.user.id,
            type: "WARN",
            expiresAt: null,
        });

        ctx.emitter.emit("ActionIssued", newAction, target, ctx);

        return ctx.messageUtil.send(message.channelId, {
            isPrivate: true,
            content: `${target.user.name} (\`${target.user.id}\`) has been successfully warned.`,
            replyMessageIds: [message.id],
        });
    },
};

export default Warn;

// declare module "@guildedjs/guilded-api-typings" {
//     export interface RESTPostChannelMessagesBody {
//         isPrivate?: boolean;
//         isSilent?: boolean;
//         replyMessageIds?: string[];
//         content: string;
//         embeds?: Embed[];
//     }
// }
