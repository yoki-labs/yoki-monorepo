import { Colors } from "@yokilabs/util";
import { stripIndents } from "common-tags";

import { RoleType } from "../../typings";
import { Category, Command } from "../commands";

const Edit: Command = {
    name: "modmail-edit",
    subName: "edit",
    description: "Edit a message in a modmail thread.",
    usage: "<messageId> <...content>",
    examples: ["e9a5987a-b1f7-4252-b032-cbd1a0ac4edb Fixing a typo!"],
    subCommand: true,
    requiredRole: RoleType.MINIMOD,
    category: Category.Modmail,
    args: [
        {
            name: "messageId",
            type: "string",
        },
        {
            name: "content",
            type: "rest",
        },
    ],
    execute: async (message, args, ctx, { member }) => {
        const messageId = args.messageId as string;
        const content = args.content as string;
        const isCurrentChannelModmail = await ctx.prisma.modmailThread.findFirst({ where: { serverId: message.serverId!, modFacingChannelId: message.channelId, closed: false } });
        if (!isCurrentChannelModmail) return ctx.messageUtil.replyWithError(message, `Not a modmail channel`, `This channel is not a modmail channel!`);

        const sentModmailMessage = await ctx.prisma.modmailMessage.findFirst({ where: { originalMessageId: messageId } });
        if (!sentModmailMessage) return ctx.messageUtil.replyWithError(message, `Invalid message`, `That is not a valid sent modmail message!`);
        const fetchSentModmailMessage = await ctx.messages.fetch(isCurrentChannelModmail.userFacingChannelId, sentModmailMessage.sentMessageId);
        if (!fetchSentModmailMessage) return ctx.messageUtil.replyWithError(message, `Message deleted`, `This message has been manually deleted.`);

        fetchSentModmailMessage.embeds![0].description = stripIndents`<@${isCurrentChannelModmail.openerId}>
			${content}
		`;

        await ctx.messages.update(isCurrentChannelModmail.userFacingChannelId, sentModmailMessage.sentMessageId, {
            embeds: fetchSentModmailMessage.embeds.map((x) => x.toJSON()),
        });

        const createdModmailMessage = await ctx.prisma.modmailMessage.update({
            where: {
                originalMessageId: sentModmailMessage.originalMessageId,
            },
            data: {
                content,
            },
        });
        void ctx.messages.delete(message.channelId, message.id);

        return ctx.messages.send(message.channelId, {
            embeds: [
                {
                    title: "Updated Message!",
                    description: content,
                    author: {
                        name: `${member.user!.name} (${member.user!.id})`,
                    },
                    color: Colors.green,
                    timestamp: new Date().toISOString(),
                    footer: {
                        text: `Message ID ${createdModmailMessage.originalMessageId}`,
                    },
                },
            ],
        });
    },
};

export default Edit;
