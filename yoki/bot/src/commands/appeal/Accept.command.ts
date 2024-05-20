import { AppealStatus } from "@prisma/client";
import { inlineCode } from "@yokilabs/bot";

import { RoleType } from "../../typings";
import { Category, Command } from "../commands";

const Accept: Command = {
    name: "appeal-accept",
    subName: "accept",
    description: "Accept the specified ban appeal and unban the user who applied.",
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
        },
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
                status: AppealStatus.ACCEPTED,
                staffNote,
            },
        });

        // If ban appeal was accepted, it is supposed to auto-unban
        const memberBan = await ctx.bans.fetch(message.serverId!, fetchedAppeal.creatorId).catch(() => null);
        if (memberBan) await ctx.bans.unban(message.serverId!, fetchedAppeal.creatorId);

        return ctx.messageUtil.replyWithSuccess(
            message,
            fetchedAppeal.status ? `Appeal status updated` : `Appeal accepted`,
            `Appeal ${inlineCode(appealId)} has been successfully ${fetchedAppeal.status ? "modified" : "accepted"}.`
        );
    },
};

export default Accept;
