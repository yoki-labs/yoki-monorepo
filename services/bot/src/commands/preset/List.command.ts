import type { Preset } from "@prisma/client";
import { stripIndents } from "common-tags";

import { RoleType } from "../../typings";
import { inlineCode } from "../../utils/formatters";
import type { Command } from "../Command";

const List: Command = {
    name: "preset-list",
    description: "List the presets enabled for this server, along with the presets Yoki offers.",
    usage: "",
    subName: "list",
    subCommand: true,
    requiredRole: RoleType.MOD,
    execute: async (message, _args, ctx) => {
        const enabledPresets = await ctx.dbUtil.getEnabledPresets(message.serverId!);

        const disabledWords = getDisabledPresets(ctx.contentFilterUtil.presets, enabledPresets);
        const disabledLinks = getDisabledPresets(ctx.linkFilterUtil.presets, enabledPresets);

        return ctx.messageUtil.replyWithInfo(
            message,
            `Presets`,
            stripIndents`
				**Enabled Presets:** ${enabledPresets.map((preset) => inlineCode(preset.preset)).join(", ") || "None"}

				**Disabled Presets:** ${disabledWords.concat(disabledLinks).join(", ") || "None"}
			`
        );
    },
};

function getDisabledPresets<T>(presets: Record<string, T>, anyEnabled: Preset[]) {
    const all = Object.keys(presets);
    const enabled = anyEnabled.map((x) => x.preset);
    return all.filter((x) => !enabled.includes(x)).map(inlineCode);
}

export default List;
