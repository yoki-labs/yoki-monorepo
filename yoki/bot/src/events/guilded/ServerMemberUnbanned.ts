import { LogChannelType } from "@prisma/client";
import { codeBlock, inlineCode } from "@yokilabs/bot";
import { Colors } from "@yokilabs/utils";
import { stripIndents } from "common-tags";

import type { GEvent } from "../../typings";

export default {
    execute: async ([memberBan, ctx]) => {
        const { serverId, reason } = memberBan;

        const server = await ctx.dbUtil.getServer(serverId, false);
        if (!server) return;

        const userId = memberBan.user.id;
        const authorId = memberBan.createdBy;

        // check if there's a log channel channel for member leaves
        const memberBanLogChannel = await ctx.dbUtil.getLogChannel(serverId!, LogChannelType.member_bans);
        if (memberBanLogChannel) {
            // send the log channel message with the content/data of the deleted message
            await ctx.messageUtil.sendLog({
                where: memberBanLogChannel.channelId,
                title: `User unbanned`,
                serverId,
                description: `<@${userId}> (${inlineCode(userId)}) had their ban, which was created by <@${authorId}>, lifted.`,
                color: Colors.red,
                additionalInfo: stripIndents`
                    **Banned:** ${server.formatTimezone(new Date(memberBan.createdAt))}
                `,
                fields: [
                    {
                        name: "Ban reason",
                        value: reason ? codeBlock(reason) : "No reason provided.",
                    },
                ],
                // occurred: new Date().toISOString(),
            });
        }
    },
    name: "memberUnbanned",
} satisfies GEvent<"memberUnbanned">;
