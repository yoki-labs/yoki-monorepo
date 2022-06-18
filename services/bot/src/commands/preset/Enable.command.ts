import { inlineCode } from "../../formatters";
import { transformSeverityStringToEnum } from "../../modules/content-filter";
import { RoleType } from "../../typings";
import type { Command } from "../Command";

const Enable: Command = {
    name: "preset-enable",
    subName: "enable",
    description: "Enable a preset",
    usage: "<preset-to-enable> [severity]",
    subCommand: true,
    requiredRole: RoleType.MOD,
    args: [
        {
            name: "preset",
            type: "string",
        },
        {
            name: "severity",
            type: "string",
        },
    ],
    execute: async (message, args, ctx) => {
        const preset = args.preset as string;
        const severity = transformSeverityStringToEnum((args.severity as string | null) ?? "warn");
        const allPresets = Object.keys(ctx.contentFilterUtil.presets);

        if (!allPresets.includes(preset))
            return ctx.messageUtil.replyWithAlert(message, `No such preset`, `That is not a valid preset. Your options are: ${allPresets.map((x) => inlineCode(x)).join(", ")}`);
        if (!severity) return ctx.messageUtil.replyWithAlert(message, `No such severity level`, `Sorry, but that is not a valid severity level!`);

        if ((await ctx.prisma.preset.findMany({ where: { serverId: message.serverId!, preset } })).length)
            return ctx.messageUtil.replyWithAlert(message, "Preset already enabled!", `You have already enabled this preset with the severity of ${severity}.`);
        return ctx.dbUtil
            .enablePreset(message.serverId!, preset, severity)
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
