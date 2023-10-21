import { LogChannelType } from "@prisma/client";
import { inlineCode } from "@yokilabs/bot";
import { Colors } from "@yokilabs/utils";
import { codeBlock, stripIndents } from "common-tags";

import type { GEvent } from "../../typings";

export default {
    execute: async ([memberBan, ctx]) => {
        const { serverId } = memberBan;
        const targetId = memberBan.target.id;
        const { reason } = memberBan;
        const createdBy = memberBan.createdById;

        const server = await ctx.dbUtil.getServer(serverId, false);
        if (!server)
            return;

        // check if there's a log channel channel for member leaves
        const memberBanLogChannel = await ctx.dbUtil.getLogChannel(serverId!, LogChannelType.member_bans);
        if (memberBanLogChannel) {
            // send the log channel message with the content/data of the deleted message
            await ctx.messageUtil.sendLog({
                where: memberBanLogChannel.channelId,
                title: `User banned`,
                serverId,
                description: `<@${targetId}> (${inlineCode(targetId)}) has been banned from the server by <@${createdBy}>.`,
                color: Colors.red,
                additionalInfo: stripIndents`
                    **Banned:** ${server.formatTimezone(memberBan.createdAt)}
                `,
                fields: [
                    {
                        name: "Reason",
                        value: reason ? codeBlock(reason) : "No reason provided.",
                    },
                ],
                // occurred: createdAt,
            });
        }
    },
    name: "memberBanned",
} satisfies GEvent<"memberBanned">;
