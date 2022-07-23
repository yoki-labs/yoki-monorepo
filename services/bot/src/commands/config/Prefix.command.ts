import { inlineCode } from "../../formatters";
import { RoleType } from "../../typings";
import { Category } from "../Category";
import type { Command } from "../Command";

const Prefix: Command = {
    name: "prefix",
    description: "Change/view the prefix of this server",
    usage: "[new prefix]",
    examples: ["y?", ""],
    category: Category.Settings,
    requiredRole: RoleType.ADMIN,
    args: [{ name: "newPrefix", type: "string", optional: true, max: 20 }],
    execute: async (message, args, ctx, commandCtx) => {
        const newPrefix = args.newPrefix as string | null;
        if (!newPrefix) {
            const { prefix } = commandCtx.server;
            return prefix
                ? ctx.messageUtil.replyWithInfo(message, `Server prefix`, `The prefix for this server is ${inlineCode(prefix?.replaceAll("`", "'"))}`); 
                : ctx.messageUtil.replyWithNullState(message, `No server prefix`, `This server does not have any prefix set.`);
        }
        await ctx.prisma.server.update({ where: { id: commandCtx.server.id }, data: { prefix: newPrefix } });
        return ctx.messageUtil.replyWithSuccess(message, `Server prefix set`, `The new prefix for this server is ${inlineCode(newPrefix.replaceAll("`", "'"))}`);
    },
};

export default Prefix;
