import { stripIndents } from "common-tags";

import { RoleType } from "../../typings";
import type { Command } from "../Command";

const History: Command = {
    name: "case",
    description: "Get the info for a case.",
    usage: "<caseId>",
    requiredRole: RoleType.MOD,
    args: [
        {
            name: "caseId",
            type: "string",
        },
    ],
    execute: async (message, args, ctx) => {
        const caseId = args.caseId as string;

        const [fetchedCase] = await ctx.prisma.action.findMany({
            where: {
                serverId: message.serverId!,
                referenceId: caseId,
            },
        });

        if (!fetchedCase) return ctx.messageUtil.send(message.channelId, "A case with that ID does not exist!");
        const member = await ctx.serverUtil.getMember(message.serverId!, fetchedCase.targetId);
        return ctx.messageUtil.send(
            message.channelId,
            stripIndents`
				**Target:** \`${member.user.name} (${member.user.id})\`
				**Type:** \`${fetchedCase.type}\`
				**Reason:** \`${fetchedCase.reason}\`
				${
                    fetchedCase.expiresAt
                        ? `**Expiration:** \`${fetchedCase.expiresAt.toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                          })} EST\``
                        : ""
                }
			`
        );
    },
};

export default History;
