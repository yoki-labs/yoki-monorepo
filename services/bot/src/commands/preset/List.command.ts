import { stripIndents } from "common-tags";

import { RoleType } from "../../typings";
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
        const enabledPresets = await ctx.contentFilterUtil.getEnabledPresets(message.serverId!);
        return ctx.messageUtil.send(
            message.channelId,
            stripIndents`
				All Preset Options: ${Object.keys(allPresets)
                    .map((preset) => `\`${preset}\``)
                    .join(", ")}

				Enabled Presets: ${enabledPresets.map((preset) => `\`${preset.preset}\``).join(", ")}
			`
        );
    },
};

export default List;
