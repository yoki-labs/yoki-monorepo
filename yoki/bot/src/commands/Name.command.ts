import { inlineQuote } from "@yokilabs/bot";

import { RoleType } from "../typings";
import { Category, Command } from "./commands";

const Prefix: Command = {
    name: "name",
    description: "Set or remove the nickname of Yoki in this server.",
    // usage: "[new prefix]",
    examples: ["Auto-mod", "Yoki"],
    category: Category.Custom,
    requiredRole: RoleType.ADMIN,
    args: [{ name: "nickname", display: "Yoki's new nickname", type: "rest", max: 32 }],
    execute: async (message, args, ctx) => {
        const nickname = args.nickname as string;

        // Reset the nickname if the name is the default one
        if (nickname === ctx.user!.name) await ctx.members.resetNickname(message.serverId!, ctx.user!.id);
        else await ctx.members.updateNickname(message.serverId!, ctx.user!.id, nickname);

        return ctx.messageUtil.replyWithSuccess(message, `Server nickname set`, `The nickname of Yoki for this server has been set to ${inlineQuote(nickname)}.`);
    },
};

export default Prefix;
