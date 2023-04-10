import { transformSeverityStringToEnum } from "../../modules/content-filter";
import { RoleType } from "../../typings";
import { inlineCode } from "@yokilabs/util";
import type { Command } from "../commands";

const Enable: Command = {
    name: "preset-enable",
    subName: "enable",
    description: "Enables a filter preset.",
    usage: "<preset-to-enable> <severity> [infraction points=5]",
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
            optional: true,
        },
        {
            name: "infractionPoints",
            type: "number",
            optional: true,
        },
    ],
    execute: async (message, args, ctx) => {
        const preset = args.preset as string;
        const severity = transformSeverityStringToEnum((args.severity as string | null) ?? "warn");
        const infractionPoints = args.infractionPoints as number | null;
        const allPresets = Object.keys(ctx.contentFilterUtil.presets).concat(Object.keys(ctx.linkFilterUtil.presets));

        if (!allPresets.includes(preset))
            return ctx.messageUtil.replyWithError(message, `No such preset`, `That is not a valid preset. Your options are: ${allPresets.map((x) => inlineCode(x)).join(", ")}`);
        if (!severity) return ctx.messageUtil.replyWithError(message, `No such severity level`, `Sorry, but that is not a valid severity level!`);

        const existingPreset = await ctx.prisma.preset.findFirst({ where: { serverId: message.serverId!, preset } });
        if (existingPreset?.severity === severity && (!infractionPoints || existingPreset?.infractionPoints === infractionPoints))
            return ctx.messageUtil.replyWithError(
                message,
                "Preset already enabled!",
                `You have already enabled this preset with the severity of ${inlineCode(severity.toLowerCase())} and this same level of infraction points.`
            );

        const action = `${existingPreset ? "updated" : "enabled"}`;

        return (
            existingPreset
                ? ctx.prisma.preset.update({
                    where: { id: existingPreset.id },
                    data: { severity, infractionPoints },
                })
                : ctx.prisma.preset.create({
                    data: { serverId: message.serverId!, preset, severity, infractionPoints },
                })
        )
            .then(() =>
                ctx.messageUtil.replyWithSuccess(
                    message,
                    `Preset ${action}`,
                    `Successfully ${action} the ${inlineCode(
                        preset
                    )} preset for this server. You can modify the severity or infraction points applied by running this command again with new values.`
                )
            )
            .catch((e: Error) =>
                ctx.messageUtil.replyWithUnexpected(
                    message,
                    `There was an issue enabling the ${inlineCode(preset)} preset for your server. Please forward this error to bot staff: ${inlineCode(e.message)}`
                )
            );
    },
};

export default Enable;
