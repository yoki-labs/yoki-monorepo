import { RoleType } from "../../typings";
import { Category } from "../Category";
import type { Command } from "../Command";

const AntiHoist: Command = {
    name: "config-antihoist",
    description: "Set or view whether anti-hoist is enabled.",
    usage: "[enable/disable]",
    examples: ["enable", ""],
    subCommand: true,
    category: Category.Settings,
    subName: "antihoist",
    requiredRole: RoleType.ADMIN,
    args: [{ name: "newSetting", optional: true, type: "boolean" }],
    execute: async (message, args, ctx, commandCtx) => {
        const newSetting = args.newSetting as boolean | null;

        if (!newSetting) {
            const verb = commandCtx.server.antiHoist ? `will` : `won't`;

            return ctx.messageUtil.replyWithInfo(message, `Hoisters ${verb} be filtered`, `Members that have a \`!\` or a \`.\` in the front of their name ${verb} be filtered.`);
        }

        await ctx.prisma.server.updateMany({ data: { antiHoist: newSetting }, where: { serverId: message.serverId! } });
        return ctx.messageUtil.replyWithSuccess(message, `Filter settings modified`, `Members that hoist themselves ${newSetting ? "will" : "won't"} be renamed.`);
    },
};

export default AntiHoist;
