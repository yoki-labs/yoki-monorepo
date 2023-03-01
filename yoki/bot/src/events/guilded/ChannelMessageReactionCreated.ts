import type { WSChannelMessageReactionCreatedPayload } from "@guildedjs/guilded-api-typings";
import { ReactionActionType } from "@prisma/client";
import { stripIndents } from "common-tags";
import { nanoid } from "nanoid";

import type { Context, Server } from "../../typings";
import { Colors } from "../../utils/color";
import { errorEmbed, inlineCode } from "../../utils/formatters";
import { summarizeRolesOrUsers } from "../../utils/messages";

export default {
     execute: async (packet: WSChannelMessageReactionCreatedPayload, ctx: Context, server: Server) => {
    const { reaction, serverId } = packet.d;
    const { channelId, messageId, emote, createdBy } = reaction;

    const lookupReaction = await ctx.prisma.reactionAction.findFirst({
        where: { messageId, channelId, serverId, emoteId: emote.id },
    });
    if (!lookupReaction) return;

    switch (lookupReaction.actionType) {
        case ReactionActionType.MODMAIL: {
            if (!server.modmailGroupId && !server.modmailCategoryId) return;
            const userAlreadyHasChannel = await ctx.prisma.modmailThread.findFirst({ where: { openerId: createdBy, serverId, closed: false } });
            if (userAlreadyHasChannel) return;

            void ctx.amp.logEvent({ event_type: "MODMAIL_THREAD_CREATE", user_id: createdBy, event_properties: { serverId } });
            const newChannel = await ctx.rest.router
                .createChannel({
                    serverId,
                    type: "chat",
                    name: createdBy,
                    topic: `Modmail thread for ${createdBy}`,
                    groupId: server.modmailGroupId ?? undefined,
                    categoryId: server.modmailCategoryId ?? undefined,
                })
                .catch((err) => {
                    void ctx.errorHandler.send("Modmail thread creation error", [
                        errorEmbed(err, { groupId: server.modmailGroupId, categoryId: server.modmailCategoryId, serverId: server.serverId }),
                    ]);
                    return null;
                });

            if (!newChannel) return;

            const newModmailThread = await ctx.prisma.modmailThread.create({
                data: {
                    id: nanoid(13),
                    modFacingChannelId: newChannel.channel.id,
                    userFacingChannelId: channelId,
                    serverId,
                    handlingModerators: [],
                    openerId: createdBy,
                },
            });
            
            const modmailPingRole = server.modmailPingRoleId ? `<@${server.modmailPingRoleId}>` : "";
            const member = await ctx.members.fetch(serverId, createdBy, true);
            await ctx.messages.send(newChannel.channel.id, {
                content: `${modmailPingRole} A new modmail thread has been opened!`,
            });
            await ctx.messageUtil.sendInfoBlock(
                newChannel.channel.id,
                `New modmail thread opened!`,
                `A new modmail thread by ID ${inlineCode(newModmailThread.id)} has been opened by <@${member.user!.id}> (${inlineCode(member.user!.id)})`,
                {
                    fields: [
                        {
                            name: `Roles`,
                            value: summarizeRolesOrUsers(member.roleIds),
                        },
                        {
                            name: `Additional Info`,
                            value: stripIndents`
                                **Account Created:** ${server.formatTimezone(member.user!.createdAt!)} EST
                                **Joined at:** ${server.formatTimezone(member.joinedAt!)} EST
                            `,
                        },
                    ],
                }
            );

            await ctx.messages.send(channelId, {
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
}} satisfies GEvent;
