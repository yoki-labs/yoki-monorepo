import { RoleType } from "../typings";
import { inlineQuote } from "../utils/formatters";
import { Category } from "./Category";
import type { Command } from "./Command";

const Prefix: Command = {
    name: "prefix",
    description: "Set or view the prefix of this server.",
    usage: "[new prefix]",
    examples: ["y?", ""],
    category: Category.Settings,
    requiredRole: RoleType.ADMIN,
    args: [{ name: "newPrefix", type: "string", optional: true, max: 20 }],
    execute: async (message, args, ctx, commandCtx) => {
        const newPrefix = args.newPrefix as string | null;
        if (!newPrefix) {
            return ctx.messageUtil.replyWithInfo(message, "Prefix", `The prefix for this server is ${inlineQuote(commandCtx.server.prefix ?? process.env.DEFAULT_PREFIX)}`);
        }
        await ctx.prisma.server.update({ where: { id: commandCtx.server.id }, data: { prefix: newPrefix } });
        return ctx.messageUtil.replyWithSuccess(message, `Server prefix set`, `The prefix for this server has been set to ${inlineQuote(newPrefix)}.`);
    },
};

export default Prefix;
