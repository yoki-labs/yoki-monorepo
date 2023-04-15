import { inlineCode } from "@yokilabs/util";

import { RoleType } from "../../typings";
import { Category, Command } from "../commands";

const SpamInfractions: Command = {
    name: "antiraid-spaminfractions",
    description: "Set how many infraction points a user will get if they spam.",
    usage: "[infraction points]",
    examples: ["5"],
    subCommand: true,
    category: Category.Settings,
    subName: "spaminfractions",
    requiredRole: RoleType.ADMIN,
    args: [{ name: "infractionPoints", optional: true, type: "number" }],
    execute: async (message, args, ctx, { server }) => {
        const infractionPoints = args.infractionPoints as number | null;

        if (!infractionPoints)
            return ctx.messageUtil.replyWithInfo(message, `Spam infraction points`, `Spam infraction points have been set to ${inlineCode(server.spamInfractionPoints)}.`);

        await ctx.prisma.server.updateMany({ data: { spamInfractionPoints: infractionPoints }, where: { serverId: message.serverId! } });
        return ctx.messageUtil.replyWithSuccess(
            message,
            `Spam infraction points changed`,
            `Spam filter will give ${inlineCode(infractionPoints)} infraction points to user who starts spamming.`
        );
    },
};

export default SpamInfractions;
