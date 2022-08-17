import type { WSTeamMemberRemovedPayload } from "@guildedjs/guilded-api-typings";
import { LogChannelType } from "@prisma/client";
import { stripIndents } from "common-tags";

import type { Context } from "../typings";
import { Colors } from "../utils/color";
import { inlineCode } from "../utils/formatters";

export default async (packet: WSTeamMemberRemovedPayload, ctx: Context) => {
    const { userId, serverId, isBan, isKick } = packet.d;

    // check if there's a log channel channel for member leaves
    const memberLeaveLogChannel = await ctx.dbUtil.getLogChannel(serverId!, LogChannelType.member_leaves);
    if (!memberLeaveLogChannel) return void 0;

    const action = isBan ? "Banned" : isKick ? "Kicked" : "Left";

    // send the log channel message with the content/data of the deleted message
    await ctx.messageUtil.sendLog(
        memberLeaveLogChannel.channelId,
        `User Left`,
        stripIndents`
                **User:** <@${userId}> (${inlineCode(userId)})
                ${action ? `**Action Type:** ${action}` : ""}
            `,
        Colors.red,
        new Date().toISOString()
    );

    return void 0;
};
