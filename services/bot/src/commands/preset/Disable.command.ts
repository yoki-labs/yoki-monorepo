import type { Command } from "../Command";
import { RoleType } from ".prisma/client";

const Enable: Command = {
    name: "preset-disable",
    subName: "disable",
    description: "Disable a preset",
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
        const allPresets = await ctx.prisma.preset.findMany({ where: { serverId: message.serverId! } });
        if (!allPresets.map((x) => x.preset).includes(preset))
            return ctx.messageUtil.send(
                message.channelId,
                `That preset is not enabled. The enabled presets for your server are: ${allPresets.map((x) => `\`${x.preset}\``).join(", ")}`
            );

        return ctx.contentFilterUtil
            .disablePreset(message.serverId!, preset)
            .then(() => ctx.messageUtil.send(message.channelId, `Successfully disabled the \`${preset}\` preset for this server.`))
            .catch((e: Error) =>
                ctx.messageUtil.send(
                    message.channelId,
                    `There was an issue disabling the \`${preset}\` preset for your server. Please forward this error to bot staff: \`${e.message}\``
                )
            );
    },
};

export default Enable;
