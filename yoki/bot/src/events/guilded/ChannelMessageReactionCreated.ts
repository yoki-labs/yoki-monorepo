import { ReactionActionType } from "@prisma/client";

import type { GEvent } from "../../typings";

export default {
    execute: async ([reaction, ctx]) => {
        const { serverId, channelId, messageId, emote, createdBy } = reaction;

        const server = await ctx.dbUtil.getServer(serverId, false);
        if (!server) return;

        // Ignore client's own reactions
        if (createdBy === ctx.user!.id) return;

        const lookupReaction = await ctx.prisma.reactionAction.findFirst({
            where: { messageId, channelId, serverId, emoteId: emote.id },
        });

        if (!lookupReaction) return;

        switch (lookupReaction.actionType) {
            case ReactionActionType.MODMAIL: {
                if (!server.modmailEnabled) return;

                return ctx.supportUtil.createModmailThread(server, channelId, createdBy);
                // if (!server.modmailGroupId && !server.modmailCategoryId) return;

                // const userAlreadyHasChannel = await ctx.prisma.modmailThread.findFirst({ where: { openerId: createdBy, serverId, closed: false } });
                // if (userAlreadyHasChannel) return;

                // void ctx.amp.logEvent({ event_type: "MODMAIL_THREAD_CREATE", user_id: createdBy, event_properties: { serverId } });
                // const member = await ctx.members.fetch(serverId, createdBy, true);
                // const newChannel = await ctx.channels
                //     .create({
                //         serverId,
                //         type: "chat",
                //         name: `${member.user!.name.slice(0, 12)}-${createdBy}`,
                //         topic: `Modmail thread for ${createdBy}`,
                //         groupId: server.modmailGroupId ?? undefined,
                //         categoryId: server.modmailCategoryId ?? undefined,
                //     })
                //     .catch((err) => {
                //         void errorLoggerS3(ctx, "MODMAIL_THREAD_CREATE", err as Error, { serverId, createdBy });
                //         return null;
                //     });

                // if (!newChannel) return;

                // const newModmailThread = await ctx.prisma.modmailThread.create({
                //     data: {
                //         id: nanoid(13),
                //         modFacingChannelId: newChannel.id,
                //         userFacingChannelId: channelId,
                //         serverId,
                //         handlingModerators: [],
                //         openerId: createdBy,
                //     },
                // });

                // const modmailPingRole = server.modmailPingRoleId ? `<@${server.modmailPingRoleId}> ` : "";
                // await ctx.messageUtil.sendInfoBlock(
                //     newChannel.id,
                //     `New modmail thread opened`,
                //     `${modmailPingRole}A new modmail thread by ID ${inlineCode(newModmailThread.id)} has been opened by <@${member.user!.id}> (${inlineCode(
                //         member.user!.id
                //     )}). You can send messages to this user by doing \`${server.prefix ?? ctx.prefix}reply the text contents here\``,
                //     {
                //         fields: [
                //             {
                //                 name: `Roles`,
                //                 value: summarizeRolesOrUsers(member.roleIds),
                //             },
                //             {
                //                 name: `Additional Info`,
                //                 value: stripIndents`
                //                     **Account Created:** ${server.formatTimezone(member.user!.createdAt!)} EST
                //                     **Joined at:** ${server.formatTimezone(member.joinedAt!)} EST
                //                 `,
                //             },
                //         ],
                //     }
                // );

                // await ctx.messageUtil.sendSuccessBlock(channelId, "Successfully opened Modmail thread!", `<@${createdBy}>, a moderator will be with you shortly!`, undefined, {
                //     isPrivate: true,
                // });
                // break;
            }
        }
    },
    name: "messageReactionCreated",
} satisfies GEvent<"messageReactionCreated">;
