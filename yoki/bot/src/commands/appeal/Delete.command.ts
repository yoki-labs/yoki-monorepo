import { inlineCode } from "@yokilabs/bot";

import { RoleType } from "../../typings";
import { Category, Command } from "../commands";

const Delete: Command = {
    name: "appeal-delete",
    subName: "delete",
    description: "Delete the specified appeal.",
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
    ],
    execute: async (message, args, ctx) => {
        const appealId = args.appealId as number;

        const [fetchedAppeal] = await ctx.prisma.appeal.findMany({
            where: {
                serverId: message.serverId!,
                id: appealId,
            },
        });

        if (!fetchedAppeal) return ctx.messageUtil.replyWithError(message, `Unknown appeal`, `Appeal ${inlineCode(appealId)} does not exist!`);

        await ctx.prisma.appeal.delete({
            where: {
                id: appealId,
            },
        });

        return ctx.messageUtil.replyWithSuccess(message, `Appeal deleted`, `Appeal ${inlineCode(appealId)} has been successfully deleted.`);
    },
};

export default Delete;
