import { Preset, PresetType } from "@prisma/client";
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
        const enabledPresets = await ctx.dbUtil.getAllEnabledPresets(message.serverId!);

        const disabledWords = getDisabledPresets(ctx.contentFilterUtil.presets, enabledPresets, PresetType.WORD, "phrase");
        const disabledLinks = getDisabledPresets(ctx.linkFilterUtil.presets, enabledPresets, PresetType.LINK, "URL");

        return ctx.messageUtil.replyWithInfo(
            message,
            `Presets`,
            stripIndents`
				**Enabled Presets:** ${enabledPresets.map((preset) => `${inlineCode(preset.preset)} (${preset.type === PresetType.WORD ? "phrase" : preset.type})`).join(", ") || "None"}

				**Disabled Presets:** ${disabledWords.concat(disabledLinks).join(", ") || "None"}
			`
        );
    },
};

function getDisabledPresets<T>(presets: Record<string, T>, anyEnabled: Preset[], type: PresetType, name: string) {
    const all = Object.keys(presets);
    const enabled = anyEnabled.filter((x) => x.type === type).map((x) => x.preset);
    return all.filter((x) => !enabled.includes(x)).map((x) => `${inlineCode(x)} (${name})`);
}

export default List;
