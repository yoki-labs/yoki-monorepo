import { LogChannelType } from "@prisma/client";
import { codeBlock, Colors, inlineCode } from "@yokilabs/bot";
import { stripIndents } from "common-tags";
import { WebhookEmbed } from "guilded.js";
import { nanoid } from "nanoid";

import type { GEvent } from "../../typings";

export default {
    execute: async ([memberBan, ctx]) => {
        const { serverId, reason } = memberBan;

        const userId = memberBan.user.id;
        const authorId = memberBan.createdBy;

        // check if there's a log channel channel for member leaves
        const memberBanLogChannel = await ctx.dbUtil.getLogChannel(serverId!, LogChannelType.member_bans);
        if (memberBanLogChannel) {
            try {
                // send the log channel message with the content/data of the deleted message
                await ctx.messageUtil.sendLog({
                    where: memberBanLogChannel.channelId,
                    title: `User Unbanned`,
                    serverId,
                    description: `<@${userId}> (${inlineCode(userId)}) had their ban, which was created by <@${authorId}>, lifted.`,
                    color: Colors.red,
                    fields: [
                        {
                            name: "Ban Reason",
                            value: reason ? codeBlock(reason) : "No reason provided.",
                        },
                    ],
                    occurred: new Date().toISOString(),
                });
            } catch (e) {
                // generate ID for this error, not persisted in database
                const referenceId = nanoid();
                // send error to the error webhook
                if (e instanceof Error) {
                    console.error(e);
                    void ctx.errorHandler.send("Error in logging member *un*banned event!", [
                        new WebhookEmbed()
                            .setDescription(
                                stripIndents`
                            Reference ID: ${inlineCode(referenceId)}
                            Server: ${inlineCode(serverId)}
                            User: ${inlineCode(authorId)}
                            Error: \`\`\`
                            ${e.stack ?? e.message}
                            \`\`\`
                        `
                            )
                            .setColor("RED"),
                    ]);
                }
            }
        }
        return void 0;
    },
    name: "memberUnbanned",
} satisfies GEvent<"memberUnbanned">;
