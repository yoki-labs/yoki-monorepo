import { RoleType } from "../../typings";
import { inlineCode } from "../../utils/formatters";
import { getActionAdditionalInfo, getActionFields, getActionInfo } from "../../utils/moderation";
import { Category } from "../Category";
import type { Command } from "../Command";

enum CaseAction {
    REMOVE = 1,
}

const Case: Command = {
    name: "case",
    description: "View info of a case.",
    usage: "<caseId> [remove]",
    examples: ["123456789-1234567", "123456789-1234567 remove"],
    aliases: ["modaction", "action", "c"],
    requiredRole: RoleType.MINIMOD,
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
    execute: async (message, args, ctx, commandCtx) => {
        const caseId = args.caseId as string;
        const action = args.action as CaseAction | null;

        const [fetchedCase] = await ctx.prisma.action.findMany({
            where: {
                serverId: message.serverId!,
                id: caseId,
            },
        });

        if (!fetchedCase) return ctx.messageUtil.replyWithError(message, `Unknown case`, `A case with that ID does not exist!`);

        // Delete
        if (action === CaseAction.REMOVE) {
            await ctx.prisma.action.delete({
                where: {
                    id: caseId,
                },
            });
            return ctx.messageUtil.replyWithSuccess(message, `Case deleted`, `Case ${inlineCode(caseId)} has been successfully deleted.`);
        }

        const [title, description] = getActionInfo(ctx, fetchedCase);

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
