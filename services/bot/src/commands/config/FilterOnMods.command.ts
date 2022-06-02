import { RoleType } from "../../typings";
import { Category } from "../Category";
import type { Command } from "../Command";

const FilterOnMods: Command = {
    name: "config-filteronmods",
    description: "Set or view whether mods are filtered on this server.",
    usage: "[new setting]",
    examples: ["enable", ""],
    subCommand: true,
    category: Category.Settings,
    subName: "filteronmods",
    requiredRole: RoleType.ADMIN,
    args: [{ name: "newSetting", optional: true, type: "boolean" }],
    execute: async (message, args, ctx, commandCtx) => {
        const newSetting = args.newSetting as boolean;

        if (typeof newSetting == "undefined") {
            const verb = commandCtx.server.filterOnMods ? `will` : `won't`;

            return ctx.messageUtil.replyWithInfo(message, `Mods ${verb} be filtered`, `Messages and content posted by staff members ${verb} be filtered.`);
        }

        await ctx.prisma.server.updateMany({ data: { filterOnMods: newSetting }, where: { serverId: message.serverId! } });
        return ctx.messageUtil.replyWithSuccess(
            message,
            `Filter settings modified`,
            newSetting ? `Messages sent by mods from now on will be filtered.` : `Messages sent by mods will no longer be filtered.`
        );
    },
};

export default FilterOnMods;
