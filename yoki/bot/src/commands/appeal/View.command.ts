import { AppealStatus } from "@prisma/client";
import { codeBlock, inlineCode } from "@yokilabs/bot";
import { Colors } from "@yokilabs/utils";
import { stripIndents } from "common-tags";
import { EmbedField } from "guilded.js";

import { RoleType } from "../../typings";
import { Category, Command } from "../commands";

const View: Command = {
    name: "appeal-view",
    subName: "view",
    description: "View information about the specified appeal.",
    // usage: "<caseId> [remove]",
    examples: ["12345"],
    requiredRole: RoleType.MINIMOD,
    category: Category.Moderation,
    subCommand: true,
    args: [
        {
            name: "appealId",
            display: "appeal ID",
            type: "number",
        },
    ],
    execute: async (message, args, ctx, { server }) => {
        const appealId = args.appealId as number;

        const [fetchedAppeal] = await ctx.prisma.appeal.findMany({
            where: {
                serverId: message.serverId!,
                id: appealId,
            },
        });

        if (!fetchedAppeal) return ctx.messageUtil.replyWithError(message, `Unknown appeal`, `An appeal with that ID does not exist!`);

        const statusEmote =
            fetchedAppeal.status === AppealStatus.ACCEPTED ? `large_green_circle` : fetchedAppeal.status === AppealStatus.DECLINED ? `red_circle` : `large_orange_circle`;

        // View
        return ctx.messageUtil.replyWithEmbed(
            message,
            {
                title: `:${statusEmote}: ${
                    fetchedAppeal.content.length > 50 ? `${fetchedAppeal.content.substring(0, 50).replaceAll(`\n`, ` `)}...` : fetchedAppeal.content.replaceAll(`\n`, ` `)
                } (${inlineCode(fetchedAppeal.id)})`,
                description: `Ban appeal submitted by <@${fetchedAppeal.creatorId}> (\`${fetchedAppeal.creatorId}\`).`,
                color: Colors.blockBackground,
                fields: [
                    {
                        name: "Reason",
                        value: codeBlock(fetchedAppeal.content, `md`),
                    },
                    fetchedAppeal.staffNote && {
                        name: "Staff note",
                        value: codeBlock(fetchedAppeal.staffNote, `md`),
                    },
                    {
                        name: "Additional info",
                        value: stripIndents`
                            **Appeal created:** ${server.formatTimezone(fetchedAppeal.createdAt)}
                            **Status:** ${fetchedAppeal.status ? fetchedAppeal.status[0] + fetchedAppeal.status.toLowerCase().substring(1) : "Awaiting"}
                        `,
                    },
                ].filter(Boolean) as EmbedField[],
            },
            {
                isSilent: true,
            }
        );
    },
};

export default View;
