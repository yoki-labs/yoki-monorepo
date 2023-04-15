import { RoleType } from "../../typings";
import type { Command } from "../commands";

const descriptions: Record<string, string> = {
    sexual: "Words for sexual objects or actions",
    slurs: "Words that are derogatory towards specific groups",
    profanity: "Day-to-day casual swear words",
    "sexual-links": "Links that are of sexual nature",
};

const List: Command = {
    name: "preset-list",
    description: "List the presets enabled for this server, along with the presets Yoki offers.",
    usage: "",
    subName: "list",
    subCommand: true,
    requiredRole: RoleType.MOD,
    execute: async (message, _args, ctx) => {
        const enabledPresets = await ctx.dbUtil.getEnabledPresets(message.serverId!);

        const all = Object.keys(ctx.contentFilterUtil.presets).concat(Object.keys(ctx.linkFilterUtil.presets));
        // const disabledWords = getDisabledPresets(ctx.contentFilterUtil.presets, enabledPresets);
        // const disabledLinks = getDisabledPresets(ctx.linkFilterUtil.presets, enabledPresets);

        return ctx.messageUtil.replyWithEnableStateList(
            message,
            `Presets`,
            enabledPresets.map((x) => x.preset),
            all,
            descriptions
        );
        // return ctx.messageUtil.replyWithInfo(
        //     message,
        //     `Presets`,
        //     stripIndents`
        // 		**Enabled Presets:** ${enabledPresets.map((preset) => inlineCode(preset.preset)).join(", ") || "None"}

        // 		**Disabled Presets:** ${disabledWords.concat(disabledLinks).join(", ") || "None"}
        // 	`
        // );
    },
};

// function getDisabledPresets<T>(presets: Record<string, T>, anyEnabled: Preset[]) {
//     const all = Object.keys(presets);
//     const enabled = anyEnabled.map((x) => x.preset);
//     return all.filter((x) => !enabled.includes(x)).map(inlineCode);
// }

export default List;
