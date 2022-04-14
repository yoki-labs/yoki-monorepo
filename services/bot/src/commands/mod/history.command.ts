import { stripIndents } from "common-tags";

import { ContentFilterUtil } from "../../functions/content-filter";
import type { Command } from "../Command";
import { RoleType } from ".prisma/client";

const History: Command = {
    name: "history",
    description: "Get the history for a user.",
    usage: "<targetId>",
    requiredRole: RoleType.MOD,
    args: [
        {
            name: "targetId",
            type: "string",
        },
    ],
    execute: async (message, args, ctx) => {
        const targetId = args.targetId as string;

        const actions = await ctx.prisma.action.findMany({
            where: {
                serverId: message.serverId!,
                targetId,
            },
        });

        if (!actions.length) return ctx.messageUtil.send(message.channelId, "Squeakly clean history!");
        return ctx.messageUtil.send(
            message.channelId,
            stripIndents`
				${actions.map((x) => `**ID:** \`${x.referenceId}\`, **TYPE:** \`${x.type}\`, **REASON:** \`${x.reason}\``).join("\n")}

				**Total Infraction Points:** ${ContentFilterUtil.totalAllInfractionPoints(actions)}
			`
        );
    },
};

export default History;
