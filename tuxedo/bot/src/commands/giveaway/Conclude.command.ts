import { inlineCode } from "@yokilabs/bot";

import { Category, Command } from "../commands";
import { RoleType } from "@prisma/client";

const Conclude: Command = {
    name: "giveaway-conclude",
    description: "Concludes an on-going giveaway and shows the winners early",
    subName: "conclude",
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
        else if (giveaway.hasEnded) return ctx.messageUtil.replyWithError(message, "Already ended", `The giveaway by ID ${inlineCode(id)} has already ended.`);

        return ctx.giveawayUtil.concludeGiveaway(giveaway);
    },
};

export default Conclude;
