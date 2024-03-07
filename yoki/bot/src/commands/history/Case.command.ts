import { inlineCode } from "@yokilabs/bot";

import { RoleType } from "../../typings";
import { getActionAdditionalInfo, getActionFields, getActionInfo } from "../../utils/moderation";
import { Category, Command } from "../commands";

const Case: Command = {
    name: "case",
    description: "View info about the specified case.",
    // usage: "<caseId> [remove]",
    examples: ["123456789-1234567", "123456789-1234567 remove"],
    requiredRole: RoleType.MINIMOD,
    category: Category.Moderation,
    args: [
        {
            name: "caseId",
            display: "case ID",
            type: "string",
        },
        {
            name: "action",
            display: "remove",
            type: "string",
            optional: true,
        },
    ],
    execute: async (message, args, ctx, commandCtx) => {
        const caseId = args.caseId as string;
        const remove = (args.action as string)?.toLowerCase() === "remove";

        const [fetchedCase] = await ctx.prisma.action.findMany({
            where: {
                serverId: message.serverId!,
                id: caseId,
            },
        });

        if (!fetchedCase) return ctx.messageUtil.replyWithError(message, `Unknown case`, `A case with that ID does not exist!`);

        // Delete
        if (remove) {
            await ctx.prisma.action.delete({
                where: {
                    id: caseId,
                },
            });
            return ctx.messageUtil.replyWithSuccess(message, `Case deleted`, `Case ${inlineCode(caseId)} has been successfully deleted.`);
        }

        const [title, description] = getActionInfo(fetchedCase);

        // View
        return ctx.messageUtil.replyWithInfo(
            message,
            title,
            description,
            {
                fields: getActionFields(fetchedCase).concat({ name: "Additional Info", value: getActionAdditionalInfo(fetchedCase, commandCtx.server.getTimezone()) }),
            },
            {
                isSilent: true,
            }
        );
    },
};

export default Case;
