import { inlineCode } from "@yokilabs/bot";

import { RoleType } from "../../typings";
import { Category, Command } from "../commands";
import { AppealStatus } from "@prisma/client";

const Decline: Command = {
    name: "appeal-decline",
    subName: "decline",
    description: "Reject the specified ban appeal.",
    examples: ["12345"],
    requiredRole: RoleType.MOD,
    category: Category.Moderation,
    subCommand: true,
    args: [
        {
            name: "appealId",
            display: "appeal ID",
            type: "number",
        },
        {
            name: "staffNote",
            display: "staff note",
            type: "rest",
            optional: true,
        }
    ],
    execute: async (message, args, ctx) => {
        const appealId = args.appealId as number;
        const staffNote = args.staffNote as string | null;

        const [fetchedAppeal] = await ctx.prisma.appeal.findMany({
            where: {
                serverId: message.serverId!,
                id: appealId,
            },
        });

        if (!fetchedAppeal) return ctx.messageUtil.replyWithError(message, `Unknown appeal`, `Appeal ${inlineCode(appealId)} does not exist!`);

        await ctx.prisma.appeal.update({
            where: {
                id: appealId,
            },
            data: {
                status: AppealStatus.DECLINED,
                staffNote,
            }
        });

        return ctx.messageUtil.replyWithSuccess(message, fetchedAppeal.status ? `Appeal status updated` : `Appeal declined`, `Appeal ${inlineCode(appealId)} has been successfully ${fetchedAppeal.status ? "modified" : "declined"}.`);
    },
};

export default Decline;
