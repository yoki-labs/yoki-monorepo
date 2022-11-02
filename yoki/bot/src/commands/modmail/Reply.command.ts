import type { EmbedPayload } from "@guildedjs/guilded-api-typings";
import { stripIndents } from "common-tags";

import { RoleType } from "../../typings";
import { Colors } from "../../utils/color";
import { Category } from "../Category";
import type { Command } from "../Command";

const Reply: Command = {
    name: "reply",
    subName: "reply",
    forceShow: true,
    description: "Reply in a modmail thread.",
    usage: "<...content>",
    examples: ["Hello! What can I help you with?"],
    subCommand: true,
    requiredRole: RoleType.MINIMOD,
    category: Category.Modmail,
    args: [
        {
            name: "content",
            type: "rest",
        },
    ],
    execute: async (message, args, ctx, { member }) => {
        const content = (args.content as string).slice(0, 2000);
        const isCurrentChannelModmail = await ctx.prisma.modmailThread.findFirst({ where: { serverId: message.serverId, modFacingChannelId: message.channelId, closed: false } });
        if (!isCurrentChannelModmail) return ctx.messageUtil.replyWithError(message, `Not a modmail channel`, `This channel is not a modmail channel!`);

        const baseEmbedData: EmbedPayload = {
            author: {
                name: `${member.user.name} (${member.user.id})`,
                icon_url: member.user.avatar,
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
        await ctx.prisma.modmailMessage.create({
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
                        text: `Ticket ${isCurrentChannelModmail.id}`,
                    },
                    ...baseEmbedData,
                },
            ],
        });
    },
};

export default Reply;
