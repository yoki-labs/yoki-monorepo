import { RoleType } from "../../typings";
import { Category } from "../Category";
import type { Command } from "../Command";

const FilterOnMods: Command = {
    name: "filter-onmods",
    description: "Set or view whether mods are filtered on this server.",
    usage: "[new setting]",
    examples: ["enable", ""],
    subCommand: true,
    category: Category.Settings,
    subName: "onmods",
    requiredRole: RoleType.ADMIN,
    args: [{ name: "newSetting", optional: true, type: "boolean" }],
    execute: async (message, args, ctx, commandCtx) => {
        const newSetting = args.newSetting as boolean | null;

        if (newSetting === null) {
            const verb = commandCtx.server.filterOnMods ? `__will__` : `__won't__`;

            return ctx.messageUtil.replyWithInfo(message, `Mods ${verb} be filtered`, `Messages and content posted by staff members ${verb} be filtered.`);
        }

        await ctx.prisma.server.updateMany({ data: { filterOnMods: newSetting }, where: { serverId: message.serverId! } });
        return ctx.messageUtil.replyWithSuccess(
            message,
            `Filter settings changed`,
            newSetting ? `Messages sent by mods from now on __will be__ filtered.` : `Messages sent by mods __will no longer__ be filtered.`
        );
    },
};

export default FilterOnMods;
