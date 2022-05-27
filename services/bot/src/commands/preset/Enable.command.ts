import { inlineCode } from "../../formatters";
import { RoleType } from "../../typings";
import type { Command } from "../Command";

const Enable: Command = {
    name: "preset-enable",
    subName: "enable",
    description: "Enable a preset",
    usage: "<preset-to-enable>",
    subCommand: true,
    requiredRole: RoleType.MOD,
    args: [
        {
            name: "preset",
            type: "string",
        },
    ],
    execute: async (message, args, ctx) => {
        const preset = args.preset as string;
        const allPresets = Object.keys(ctx.contentFilterUtil.presets);
        if (!allPresets.includes(preset))
            return ctx.messageUtil.replyWithAlert(message, `No such preset`, `That is not a valid preset. Your options are: ${allPresets.map((x) => inlineCode(x)).join(", ")}`);

        return ctx.dbUtil
            .enablePreset(message.serverId!, preset)
            .then(() => ctx.messageUtil.replyWithSuccess(message, `Preset enabled`, `Successfully enabled the ${inlineCode(preset)} preset for this server.`))
            .catch((e: Error) =>
                ctx.messageUtil.replyWithError(
                    message,
                    `There was an issue enabling the ${inlineCode(preset)} preset for your server. Please forward this error to bot staff: ${inlineCode(e.message)}`
                )
            );
    },
};

export default Enable;
