import { inlineCode } from "@yokilabs/bot";

import { Category, Command } from "../commands";
import { RoleType } from "@prisma/client";

const Reroll: Command = {
    name: "giveaway-reroll",
    description: "Rerolls the winners of the giveaway.",
    subName: "reroll",
    subCommand: true,
    category: Category.Events,
    requiredRole: RoleType.MINIMOD,
    args: [
        {
            name: "id",
            type: "string",
        },
    ],
    execute: async (message, args, ctx) => {
        const id = args.id as string;

        const giveaway = await ctx.prisma.giveaway.findFirst({ where: { id } });

        if (!giveaway) return ctx.messageUtil.replyWithError(message, "Cannot find giveaway", `Cannot find giveaway by ID ${inlineCode(id)}`);

        return ctx.giveawayUtil.concludeGiveaway(giveaway);
    },
};

export default Reroll;
