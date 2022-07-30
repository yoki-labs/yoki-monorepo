import type { EmbedField } from "@guildedjs/guilded-api-typings";

import { RoleType } from "../../typings";
import { inlineCode } from "../../utils/formatters";
import { FormatDate } from "../../utils/util";
import { Category } from "../Category";
import type { Command } from "../Command";

enum CaseAction {
    REMOVE = 1,
}

const Case: Command = {
    name: "case",
    description: "Get the info for a case.",
    usage: "<caseId> [remove]",
    examples: ["123456789-1234567", "123456789-1234567 remove"],
    aliases: ["modaction", "action", "c"],
    requiredRole: RoleType.MOD,
    category: Category.Moderation,
    args: [
        {
            name: "caseId",
            type: "string",
        },
        {
            name: "action",
            type: "enum",
            values: CaseAction,
            optional: true,
        },
    ],
    execute: async (message, args, ctx) => {
        const caseId = args.caseId as string;
        const action = args.action as CaseAction | null;

        const [fetchedCase] = await ctx.prisma.action.findMany({
            where: {
                serverId: message.serverId!,
                id: caseId,
            },
        });

        if (!fetchedCase) return ctx.messageUtil.replyWithAlert(message, `Unknown case`, `A case with that ID does not exist!`);

        // Delete
        if (action === CaseAction.REMOVE) {
            await ctx.prisma.action.delete({
                where: {
                    id: caseId,
                },
            });
            return ctx.messageUtil.replyWithSuccess(message, `Case deleted`, `Case ${inlineCode(caseId)} has been successfully deleted.`);
        }

        // View
        return ctx.messageUtil.replyWithInfo(
            message,
            `Case ${inlineCode(caseId)}`,
            `<@${fetchedCase.targetId}> has received ${fetchedCase.type} by <@${fetchedCase.executorId}>`,
            {
                fields: [
                    fetchedCase.reason && {
                        name: "Reason",
                        value: (fetchedCase.reason as string).length > 1024 ? `${fetchedCase.reason.substr(0, 1021)}...` : fetchedCase.reason,
                    },
                    fetchedCase.expiresAt && {
                        name: "Expiration",
                        value: `${FormatDate(fetchedCase.expiresAt)} EST`,
                    },
                ].filter(Boolean) as EmbedField[],
            },
            {
                isSilent: true,
            }
        );
    },
};

export default Case;
