import { RoleType } from "../../typings";
import { Category } from "../Category";
import type { Command } from "../Command";

const NsfwScan: Command = {
    name: "config-nsfwscan",
    description: "Whether to scan images for NSFW content.",
    usage: "[enable/disable]",
    examples: ["enable", ""],
    subCommand: true,
    category: Category.Settings,
    subName: "nsfwscan",
    requiredRole: RoleType.ADMIN,
    args: [{ name: "newSetting", optional: true, type: "boolean" }],
    execute: async (message, args, ctx, commandCtx) => {
        if (!commandCtx.server.premium) return ctx.messageUtil.replyWithAlert(message, `Premium-only`, `NSFW scanning requires silver subscription or above.`);

        const newSetting = args.newSetting as boolean | null;

        if (newSetting === null) {
            const verb = commandCtx.server.scanNSFW ? `will` : `won't`;

            return ctx.messageUtil.replyWithInfo(message, `NSFW Images ${verb} be filtered`, `Images with NSFW content ${verb} be filtered.`);
        }

        await ctx.prisma.server.updateMany({ data: { scanNSFW: newSetting }, where: { serverId: message.serverId! } });
        return ctx.messageUtil.replyWithSuccess(message, `NSFW scanning settings modified`, `NSFW images ${newSetting ? "will" : "won't"} now be removed.`);
    },
};

export default NsfwScan;
