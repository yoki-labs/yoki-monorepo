import { PresetType } from "@prisma/client";

import { transformSeverityStringToEnum } from "../../../modules/content-filter";
import { RoleType } from "../../../typings";
import { inlineCode } from "../../../utils/formatters";
import type { Command } from "../../Command";

const Enable: Command = {
    name: "preset-phrase-enable",
    subName: "enable",
    description: "Enables a URL/domain preset.",
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
        const allPresets = Object.keys(ctx.linkFilterUtil.presets);

        if (!allPresets.includes(preset))
            return ctx.messageUtil.replyWithAlert(
                message,
                `No such URL preset`,
                `That is not a valid URL preset. Your options are: ${allPresets.map((x) => inlineCode(x)).join(", ")}`
            );
        if (!severity) return ctx.messageUtil.replyWithAlert(message, `No such severity level`, `Sorry, but that is not a valid severity level!`);

        if ((await ctx.prisma.preset.findMany({ where: { serverId: message.serverId!, preset, type: PresetType.LINK } })).length)
            return ctx.messageUtil.replyWithAlert(message, "URL preset already enabled!", `You have already enabled this URL preset with the severity of ${severity}.`);
        return ctx.dbUtil
            .enableLinkPreset(message.serverId!, preset, severity)
            .then(() => ctx.messageUtil.replyWithSuccess(message, `URL preset enabled`, `Successfully enabled the ${inlineCode(preset)} URL preset for this server.`))
            .catch((e: Error) =>
                ctx.messageUtil.replyWithError(
                    message,
                    `There was an issue enabling the ${inlineCode(preset)} URL preset for your server. Please forward this error to bot staff: ${inlineCode(e.message)}`
                )
            );
    },
};

export default Enable;
