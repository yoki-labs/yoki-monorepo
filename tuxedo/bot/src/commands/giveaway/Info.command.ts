import { RoleType } from "@prisma/client";
import { codeBlock, formatDate, inlineCode, inlineQuote, summarizeRolesOrUsers } from "@yokilabs/bot";
import { stripIndents } from "common-tags";

import { Category, Command } from "../commands";

const Info: Command = {
    name: "giveaway-info",
    description: "Gets an information about a giveaway.",
    subName: "info",
    subCommand: true,
    category: Category.Events,
    requiredRole: RoleType.MINIMOD,
    args: [
        {
            name: "id",
            type: "string",
        },
    ],
    execute: async (message, args, ctx, { server: { timezone } }) => {
        const id = args.id as string;

        const [giveaway] = await ctx.prisma.giveaway.findMany({ where: { id, serverId: message.serverId! } });

        if (!giveaway) return ctx.messageUtil.replyWithError(message, "Cannot find giveaway", `Cannot find giveaway by ID ${inlineCode(id)}`);

        return ctx.messageUtil.replyWithInfo(
            message,
            `${giveaway.hasEnded ? ":red_circle:" : ":large_green_circle:"} ${inlineQuote(giveaway.text, 20)} (${inlineCode(id)})`,
            `A giveaway has been created by <@${giveaway.createdBy}>.`,
            {
                fields: [
                    {
                        name: "Reward",
                        value: codeBlock(giveaway.text, "md"),
                    },
                    {
                        name: "Participants",
                        value: stripIndents`
                            **Max winners:** ${inlineCode(giveaway.winnerCount)}
                            ${
                                giveaway.hasEnded
                                    ? stripIndents`
                                    **Participant count:** ${inlineCode(giveaway.participants.length)}
                                    **Winners:** ${
                                        giveaway.winners.length
                                            ? summarizeRolesOrUsers(giveaway.winners)
                                            : "No one participated or the giveaway has been manually cancelled by a staff member."
                                    }
                                `
                                    : ""
                            }
                        `,
                    },
                    {
                        name: "Additional Info",
                        value: stripIndents`
                            ${giveaway.hasEnded ? ":red_circle: **Has ended.**" : ":large_green_square: **Is on-going.**"}
                            **Giveaway created:** ${formatDate(giveaway.createdAt, timezone)}
                            **End(s/ed) at:** ${formatDate(giveaway.endsAt, timezone)}
                            **In channel:** ${inlineCode(giveaway.channelId)}
                        `,
                    },
                ],
            },
            {
                isSilent: true,
            }
        );
    },
};

export default Info;
