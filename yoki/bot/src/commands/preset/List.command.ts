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
    // usage: "",
    subName: "list",
    subCommand: true,
    requiredRole: RoleType.MOD,
    execute: async (message, _args, ctx) => {
        const enabledPresets = await ctx.dbUtil.getEnabledPresets(message.serverId!);

        const all = Object.keys(ctx.contentFilterUtil.presets).concat(Object.keys(ctx.linkFilterUtil.presets));

        return ctx.messageUtil.replyWithEnableStateList(
            message,
            `Presets`,
            enabledPresets.map((x) => x.preset),
            all,
            descriptions
        );
    },
};

export default List;
