import { stripIndents } from "common-tags";

import { RoleType } from "../../typings";
import { inlineCode } from "../../utils/formatters";
import type { Command } from "../Command";

const List: Command = {
    name: "preset-list",
    description: "See all the preset options this bot has and also which ones are enabled for this server",
    usage: "",
    subName: "list",
    subCommand: true,
    requiredRole: RoleType.MOD,
    execute: async (message, _args, ctx) => {
        const allPresets = ctx.contentFilterUtil.presets;
        const enabledPresets = await ctx.dbUtil.getEnabledPresets(message.serverId!);
        return ctx.messageUtil.replyWithInfo(
            message,
            `Presets`,
            stripIndents`
				**Enabled Presets:** ${enabledPresets.map((preset) => inlineCode(preset.preset)).join(", ") || "None"}

				**All Preset Options:** ${Object.keys(allPresets)
                    .map((preset) => inlineCode(preset))
                    .join(", ")}
			`
        );
    },
};

export default List;
