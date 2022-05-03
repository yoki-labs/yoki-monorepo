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

        if (!fetchedCase) return ctx.messageUtil.sendCautionBlock(message.channelId, "Unknown case", "A case with that ID does not exist!");
        return ctx.messageUtil.sendContentBlock(
            message.channelId,
            `Case \`${caseId}\``,
            `<@${fetchedCase.targetId}> has received ${fetchedCase.type} by <@${fetchedCase.executorId}>`,
            {
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
            },
            {
                isSilent: true,
            }
        );
    },
};

export default History;
