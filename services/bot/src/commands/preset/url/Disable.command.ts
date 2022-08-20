import { PresetType } from "@prisma/client";

import { RoleType } from "../../../typings";
import { inlineCode } from "../../../utils/formatters";
import type { Command } from "../../Command";

const Enable: Command = {
    name: "preset-phrase-disable",
    subName: "disable",
    description: "Disable a preset",
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
        const allPresets = await ctx.prisma.preset.findMany({ where: { serverId: message.serverId!, type: PresetType.LINK } });
        if (!allPresets.map((x) => x.preset).includes(preset))
            return ctx.messageUtil.replyWithAlert(
                message,
                `Can't be disabled`,
                `That URL preset is not enabled. The enabled URL presets for your server are: ${allPresets.map((x) => inlineCode(x.preset)).join(", ")}`
            );

        return ctx.dbUtil
            .disableLinkPreset(message.serverId!, preset)
            .then(() => ctx.messageUtil.replyWithSuccess(message, `URL preset disabled`, `Successfully disabled the ${inlineCode(preset)} URL preset for this server.`))
            .catch((e: Error) =>
                ctx.messageUtil.replyWithError(
                    message,
                    `There was an issue disabling the ${inlineCode(preset)} URL preset for your server. Please forward this error to bot staff: ${inlineCode(e.message)}`
                )
            );
    },
};

export default Enable;
