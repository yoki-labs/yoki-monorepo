import { stripIndents } from "common-tags";

import { ContentFilterUtil } from "../../functions/content-filter";
import { RoleType } from "../../typings";
import { Category } from "../Category";
import type { Command } from "../Command";

const History: Command = {
    name: "history",
    description: "Get the history for a user.",
    usage: "<targetId>",
    requiredRole: RoleType.MOD,
    category: Category.Moderation,
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

        if (!actions.length) return ctx.messageUtil.send(message.channelId, "Squeaky clean history!");
        return ctx.messageUtil.send(
            message.channelId,
            stripIndents`
				${actions.map((x) => `**ID:** \`${x.id}\`, **TYPE:** \`${x.type}\`, **REASON:** \`${x.reason}\`${(x.triggerContent && `||${x.triggerContent}||`) ?? ""}`).join("\n")}

				**Total Infraction Points:** ${ContentFilterUtil.totalAllInfractionPoints(actions)}
			`
        );
    },
};

export default History;
