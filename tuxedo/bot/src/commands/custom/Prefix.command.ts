import { RoleType } from "@prisma/client";
import { inlineQuote } from "@yokilabs/bot";

import { Category, Command } from "../commands";

const Prefix: Command = {
    name: "prefix",
    description: "Set or view the prefix of this server.",
    examples: ["t!", "t?"],
    category: Category.Custom,
    requiredRole: RoleType.ADMIN,
    args: [{ name: "newPrefix", display: "new prefix", type: "string", optional: true, max: 20 }],
    execute: async (message, args, ctx, commandCtx) => {
        const newPrefix = args.newPrefix as string | null;
        if (!newPrefix) {
            return ctx.messageUtil.replyWithInfo(message, "Prefix", `The prefix for this server is ${inlineQuote(commandCtx.server.prefix ?? ctx.prefix)}`);
        }
        await ctx.prisma.server.update({ where: { id: commandCtx.server.id }, data: { prefix: newPrefix } });
        return ctx.messageUtil.replyWithSuccess(message, "Server prefix set", `The prefix for this server has been set to ${inlineQuote(newPrefix)}.`);
    },
};

export default Prefix;
