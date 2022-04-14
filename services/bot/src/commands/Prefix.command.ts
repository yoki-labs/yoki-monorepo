import { RoleType } from "../typings";
import type { Command } from "./Command";

const Prefix: Command = {
    name: "prefix",
    description: "Change/view the prefix of this server",
    usage: "[newPrefix]",
    requiredRole: RoleType.MOD,
    args: [{ name: "newPrefix", type: "string", optional: true }],
    execute: async (message, args, ctx, commandCtx) => {
        const newPrefix = args.newPrefix as string | null;
        if (!newPrefix) return ctx.messageUtil.send(message.channelId, `The prefix for this server is: \`${commandCtx.server.prefix}\``);
        await ctx.prisma.server.update({ where: { id: commandCtx.server.id }, data: { prefix: newPrefix } });
        return ctx.messageUtil.send(message.channelId, {
            content: `The new prefix for this server is \`${newPrefix}\``,
        });
    },
};

export default Prefix;
