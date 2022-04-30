import { RoleType } from "../../typings";
import type { Command } from "../Command";

const Enable: Command = {
    name: "preset-enable",
    subName: "enable",
    description: "Enable a preset",
    usage: "",
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
            return ctx.messageUtil.send(message.channelId, `That is not a valid preset. Your options are: ${allPresets.map((x) => `\`${x}\``).join(", ")}`);

        return ctx.dbUtil
            .enablePreset(message.serverId!, preset)
            .then(() => ctx.messageUtil.send(message.channelId, `Successfully enabled the \`${preset}\` preset for this server.`))
            .catch((e: Error) =>
                ctx.messageUtil.send(
                    message.channelId,
                    `There was an issue enabling the \`${preset}\` preset for your server. Please forward this error to bot staff: \`${e.message}\``
                )
            );
    },
};

export default Enable;
