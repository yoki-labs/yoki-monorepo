import { RoleType } from "@prisma/client";
import { inlineQuote } from "@yokilabs/bot";

import { Category, Command } from "../commands";

const Prefix: Command = {
    name: "name",
    description: "Sets or removes the nickname of Tuxo in this server.",
    examples: ["Economy", "Tuxo [BETA]"],
    category: Category.Custom,
    requiredRole: RoleType.ADMIN,
    args: [{ name: "nickname", display: "Tuxo's new nickname", type: "rest", max: 32 }],
    execute: async (message, args, ctx) => {
        const nickname = args.nickname as string;

        // Reset the nickname if the name is the default one
        if (nickname === ctx.user!.name) await ctx.members.resetNickname(message.serverId!, ctx.user!.id);
        else await ctx.members.updateNickname(message.serverId!, ctx.user!.id, nickname);

        return ctx.messageUtil.replyWithSuccess(message, `Server nickname set`, `The nickname of Tuxo for this server has been set to ${inlineQuote(nickname)}.`);
    },
};

export default Prefix;
