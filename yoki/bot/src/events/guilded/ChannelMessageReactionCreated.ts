import { ReactionActionType } from "@prisma/client";
import { Colors, errorEmbed, inlineCode, summarizeRolesOrUsers } from "@yokilabs/util";
import { stripIndents } from "common-tags";
import { nanoid } from "nanoid";

import type { GEvent } from "../../typings";

export default {
    execute: async ([reaction, ctx]) => {
        const { serverId, channelId, messageId, emote, createdBy } = reaction;
        const server = await ctx.dbUtil.getServer(serverId, false);
        if (!server) return;
        
        console.log("Received reaction. Now lookup");
        const lookupReaction = await ctx.prisma.reactionAction.findFirst({
            where: { messageId, channelId, serverId, emoteId: emote.id },
        });
        console.log("Reaction lookup done");
        
        if (!lookupReaction) return;
        
        switch (lookupReaction.actionType) {
            case ReactionActionType.MODMAIL: {
                console.log("Doing modmail. No message afterwards");
                if (!server.modmailGroupId && !server.modmailCategoryId) return;
                const userAlreadyHasChannel = await ctx.prisma.modmailThread.findFirst({ where: { openerId: createdBy, serverId, closed: false } });
                if (userAlreadyHasChannel) return;

                void ctx.amp.logEvent({ event_type: "MODMAIL_THREAD_CREATE", user_id: createdBy, event_properties: { serverId } });
                const newChannel = await ctx.channels
                    .create({
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
                        modFacingChannelId: newChannel.id,
                        userFacingChannelId: channelId,
                        serverId,
                        handlingModerators: [],
                        openerId: createdBy,
                    },
                });

                const modmailPingRole = server.modmailPingRoleId ? `<@${server.modmailPingRoleId}>` : "";
                const member = await ctx.members.fetch(serverId, createdBy, true);
                await ctx.messages.send(newChannel.id, {
                    content: `${modmailPingRole} A new modmail thread has been opened! You can send messages to this user by doing \`${server.prefix}reply content-here\``,
                });
                await ctx.messageUtil.sendInfoBlock(
                    newChannel.id,
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
    },
    name: "messageReactionCreated",
} satisfies GEvent<"messageReactionCreated">;
