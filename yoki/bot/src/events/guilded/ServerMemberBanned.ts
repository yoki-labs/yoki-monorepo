import { LogChannelType } from "@prisma/client";
import { inlineCode } from "@yokilabs/bot";
import { Colors } from "@yokilabs/utils";
import { codeBlock } from "common-tags";

import type { GEvent } from "../../typings";

export default {
    execute: async ([memberBan, ctx]) => {
        const { serverId } = memberBan;
        const targetId = memberBan.target.id;
        const { reason } = memberBan;
        const createdAt = memberBan.createdAt.toISOString();
        const createdBy = memberBan.createdById;

        // check if there's a log channel channel for member leaves
        const memberBanLogChannel = await ctx.dbUtil.getLogChannel(serverId!, LogChannelType.member_bans);
        if (memberBanLogChannel) {
            // send the log channel message with the content/data of the deleted message
            await ctx.messageUtil.sendLog({
                where: memberBanLogChannel.channelId,
                title: `User Banned`,
                serverId,
                description: `<@${targetId}> (${inlineCode(targetId)}) has been banned from the server by <@${createdBy}>.`,
                color: Colors.red,
                fields: [
                    {
                        name: "Reason",
                        value: reason ? codeBlock(reason) : "No reason provided.",
                    },
                ],
                occurred: createdAt,
            });
        }
    },
    name: "memberBanned",
} satisfies GEvent<"memberBanned">;
