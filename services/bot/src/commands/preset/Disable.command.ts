import { RoleType } from "../../typings";
import { inlineCode } from "../../utils/formatters";
import type { Command } from "../Command";

const Enable: Command = {
    name: "preset-disable",
    subName: "disable",
    description: "Disable a preset.",
    usage: "<preset>",
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
            return ctx.messageUtil.replyWithAlert(
                message,
                `Can't be disabled`,
                `That preset is not enabled. The enabled presets for your server are: ${allPresets.map((x) => inlineCode(x.preset)).join(", ")}`
            );

        return ctx.dbUtil
            .disablePreset(message.serverId!, preset)
            .then(() => ctx.messageUtil.replyWithSuccess(message, `Preset disabled`, `Successfully disabled the ${inlineCode(preset)} preset for this server.`))
            .catch((e: Error) =>
                ctx.messageUtil.replyWithError(
                    message,
                    `There was an issue disabling the ${inlineCode(preset)} preset for your server. Please forward this error to bot staff: ${inlineCode(e.message)}`
                )
            );
    },
};

export default Enable;
