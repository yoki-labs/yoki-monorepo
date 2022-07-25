import { stripIndents } from "common-tags";

import { Colors } from "../../color";
import { RoleType } from "../../typings";
import { Category } from "../Category";
import type { Command } from "../Command";

const Reply: Command = {
    name: "reply",
    subName: "reply",
    description: "Reply in a modmail thread",
    usage: "<...content>",
    examples: ["Hello! What can I help you with?"],
    subCommand: true,
    requiredRole: RoleType.MOD,
    category: Category.Moderation,
    args: [
        {
            name: "content",
            type: "rest",
        },
    ],
    execute: async (message, args, ctx, { member }) => {
        const content = args.content as string;
        const isCurrentChannelModmail = await ctx.prisma.modmailThread.findFirst({ where: { serverId: message.serverId, modFacingChannelId: message.channelId, closed: false } });
        if (!isCurrentChannelModmail) return ctx.messageUtil.replyWithError(message, "This channel is not a modmail channel!");

        const baseEmbedData = {
            author: {
                name: `${member.user.name} (${member.user.id})`,
            },
            color: Colors.green,
            timestamp: new Date().toISOString(),
        };
        const newSentMessage = await ctx.rest.router.createChannelMessage(isCurrentChannelModmail.userFacingChannelId, {
            embeds: [
                {
                    description: stripIndents`<@${isCurrentChannelModmail.openerId}>
						${content}
					`,
                    footer: {
                        text: "Moderator",
                    },
                    ...baseEmbedData,
                },
            ],
            isPrivate: true,
        });
        const createdModmailMessage = await ctx.prisma.modmailMessage.create({
            data: {
                authorId: message.createdBy,
                channelId: message.channelId,
                content,
                modmailThreadId: isCurrentChannelModmail.id,
                sentMessageId: newSentMessage.message.id,
                originalMessageId: message.id,
            },
        });
        void ctx.rest.router.deleteChannelMessage(message.channelId, message.id);
        return ctx.rest.router.createChannelMessage(message.channelId, {
            embeds: [
                {
                    description: content,
                    footer: {
                        text: `Ticket ${createdModmailMessage.originalMessageId}`,
                    },
                    ...baseEmbedData,
                },
            ],
        });
    },
};

export default Reply;
