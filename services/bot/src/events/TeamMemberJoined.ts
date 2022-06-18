import type { WSTeamMemberJoinedPayload } from "@guildedjs/guilded-api-typings";
import { Embed as WebhookEmbed } from "@guildedjs/webhook-client";
import { LogChannelType, Severity } from "@prisma/client";
import { stripIndents } from "common-tags";
import { nanoid } from "nanoid";

import { Colors } from "../color";
import { inlineCode } from "../formatters";
import type { Context, Server } from "../typings";
import { FormatDate, suspicious as sus } from "../util";

export default async (packet: WSTeamMemberJoinedPayload, ctx: Context, server: Server) => {
    const { member, serverId } = packet.d;

    if (["!", "."].some((x) => member.user.name.includes(x)))
        return ctx.rest.router.updateMemberNickname(packet.d.serverId, packet.d.member.user.id, packet.d.member.user.name.slice(1));

    // Re-add mute
    if (server.muteRoleId && (await ctx.prisma.action.findFirst({ where: { serverId, targetId: member.user.id, type: Severity.MUTE, expired: false } })))
        await ctx.rest.router.assignRoleToMember(serverId, member.user.id, server.muteRoleId);

    // check if there's a log channel channel for member joins
    const memberJoinLogChannel = await ctx.prisma.logChannel.findFirst({ where: { serverId: packet.d.serverId, type: LogChannelType.MEMBER_JOIN_LEAVE } });
    if (!memberJoinLogChannel) return void 0;
    const creationDate = new Date(member.user.createdAt);
    const suspicious = sus(creationDate);

    try {
        // send the log channel message with the content/data of the deleted message
        await ctx.messageUtil.sendLog(
            memberJoinLogChannel.channelId,
            "User Joined",
            stripIndents`
                **User:** <@${member.user.id}> (${inlineCode(member.user.id)})
                **Type** ${member.user.type ?? "user"}
				**Account Created:** \`${FormatDate(creationDate)} ${suspicious ? "(recent)" : ""}\`
            `,
            suspicious ? Colors.yellow : Colors.green,
            member.joinedAt
        );
    } catch (e) {
        // generate ID for this error, not persisted in database
        const referenceId = nanoid();
        // send error to the error webhook
        if (e instanceof Error) {
            console.error(e);
            void ctx.errorHandler.send("Error in logging message deletion!", [
                new WebhookEmbed()
                    .setDescription(
                        stripIndents`
						Reference ID: ${inlineCode(referenceId)}
						Server: ${inlineCode(packet.d.serverId)}
						User: ${inlineCode(member.user.id)}
						Error: \`\`\`
						${e.stack ?? e.message}
						\`\`\`
					`
                    )
                    .setColor("RED"),
            ]);
        }
    }
    return void 0;
};
