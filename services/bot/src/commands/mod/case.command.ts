import Embed from "@guildedjs/embeds";
import type { APIEmbedField } from "@guildedjs/guilded-api-typings";

import { RoleType } from "../../typings";
import { Category } from "../Category";
import type { Command } from "../Command";

const History: Command = {
    name: "case",
    description: "Get the info for a case.",
    usage: "<caseId>",
    requiredRole: RoleType.MOD,
    category: Category.Moderation,
    args: [
        {
            name: "caseId",
            type: "string",
        },
    ],
    execute: async (message, args, ctx) => {
        const caseId = args.caseId as string;

        const [fetchedCase] = await ctx.prisma.action.findMany({
            where: {
                serverId: message.serverId!,
                id: caseId,
            },
        });

        if (!fetchedCase) return ctx.messageUtil.send(message.channelId, "A case with that ID does not exist!");
        return ctx.messageUtil.send(
            message.channelId,
            {
                content: "Showing case's details",
                isSilent: true,
                embeds: [
                    new Embed({
                        title: `:scroll: Case \`${caseId}\``,
                        description: `<@${fetchedCase.targetId}> has received ${fetchedCase.type} by <@${fetchedCase.executorId}>`,
                        color: ctx.messageUtil.colors.bad,
                        fields: [
                            fetchedCase && {
                                name: "Reason",
                                value: (fetchedCase.reason as string).length > 1024 ? `${fetchedCase.reason?.substr(0, 1021)}...` : fetchedCase.reason,
                            },
                            fetchedCase.expiresAt && {
                                name: "Expiration",
                                value: `${fetchedCase.expiresAt.toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })} EST`,
                            },
                        ].filter(Boolean) as APIEmbedField[],
                    }),
                ],
            }
            // stripIndents`
            // 	**Target:** \`${member.user.name} (${member.user.id})\`
            // 	**Type:** \`${fetchedCase.type}\`
            // 	**Reason:** \`${fetchedCase.reason}\`
            // 	${
            //         fetchedCase.expiresAt
            //             : ""
            //     }
            // `
        );
    },
};

export default History;
