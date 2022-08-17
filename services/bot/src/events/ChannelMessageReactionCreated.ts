import type { WSChannelMessageReactionCreatedPayload } from "@guildedjs/guilded-api-typings";
import { ReactionActionType, Server } from "@prisma/client";
import { stripIndents } from "common-tags";
import { nanoid } from "nanoid";

import type { Context } from "../typings";
import client from "../utils/amplitude";
import { Colors } from "../utils/color";
import { FormatDate } from "../utils/util";

export default async (packet: WSChannelMessageReactionCreatedPayload, ctx: Context, server: Server) => {
    const { reaction, serverId } = packet.d;
    const { channelId, messageId, emote, createdBy } = reaction;

    const lookupReaction = await ctx.prisma.reactionAction.findFirst({
        where: { messageId, channelId, serverId, emoteId: emote.id },
    });
    if (!lookupReaction) return;

    switch (lookupReaction.actionType) {
        case ReactionActionType.MODMAIL: {
            if (!server.modmailGroupId) return;
            const userAlreadyHasChannel = await ctx.prisma.modmailThread.findFirst({ where: { openerId: createdBy, serverId, closed: false } });
            if (userAlreadyHasChannel) return;
            void client.logEvent({ event_type: "MODMAIL_THREAD_CREATE", user_id: createdBy, event_properties: { serverId } });
            const newChannel = await ctx.rest.router.createChannel({
                serverId,
                type: "chat",
                name: createdBy,
                topic: `Modmail thread for ${createdBy}`,
                groupId: server.modmailGroupId,
            });

            await ctx.prisma.modmailThread.create({
                data: {
                    id: nanoid(13),
                    modFacingChannelId: newChannel.channel.id,
                    userFacingChannelId: channelId,
                    serverId,
                    handlingModerators: [],
                    openerId: createdBy,
                },
            });

            const member = await ctx.serverUtil.getMember(serverId, createdBy, true, true);
            await ctx.rest.router.createChannelMessage(newChannel.channel.id, {
                content: "New modmail thread opened!",
                embeds: [
                    {
                        description: stripIndents`
							**User:** ${member.user.name}${member.nickname ? ` (${member.nickname})` : ""}
							**ID:** ${member.user.id}
							**Account Created:** ${FormatDate(new Date(member.user.createdAt))} EST
							**Joined:** ${FormatDate(new Date(member.joinedAt))} EST
							**Roles:** ${member.roleIds.map((x) => `<@${x}>`).join(" ")}
						`,
                    },
                ],
            });

            await ctx.rest.router.createChannelMessage(channelId, {
                embeds: [
                    {
                        title: "Successfully opened Modmail thread!",
                        description: `<@${createdBy}>, a moderator will be with you shortly!`,
                        color: Colors.green,
                    },
                ],
                isPrivate: true,
            });
            break;
        }
    }
};
