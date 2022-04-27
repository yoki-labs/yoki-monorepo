import { RoleType } from "../../typings";
import { Category } from "../Category";
import type { Command } from "../Command";

const FilterOnMods: Command = {
    name: "config-filteronmods",
    description: "Set or view whether mods are filtered on this server.",
    usage: "filterOnMods [newSetting]",
    subCommand: true,
    category: Category.Settings,
    subName: "filteronmods",
    requiredRole: RoleType.ADMIN,
    args: [{ name: "newSetting", optional: true, type: "boolean" }],
    execute: async (message, args, ctx, commandCtx) => {
        const newSetting = args.newSetting as boolean;

        if (typeof newSetting == "undefined") {
            return ctx.messageUtil.send(message.channelId, `Filter on mods is set to: \`${commandCtx.server.filterOnMods}\``);
        }

        await ctx.prisma.server.updateMany({ data: { filterOnMods: newSetting }, where: { serverId: message.serverId! } });
        return ctx.messageUtil.send(message.channelId, `Successfully set filter on mods to \`${newSetting}\``);
    },
};

export default FilterOnMods;
