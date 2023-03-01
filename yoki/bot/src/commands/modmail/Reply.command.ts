import { stripIndents } from "common-tags";
import { Embed } from "guilded.js";

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
        const isCurrentChannelModmail = await ctx.prisma.modmailThread.findFirst({ where: { serverId: message.serverId!, modFacingChannelId: message.channelId, closed: false } });
        if (!isCurrentChannelModmail) return ctx.messageUtil.replyWithError(message, `Not a modmail channel`, `This channel is not a modmail channel!`);

        const embed: Embed = new Embed()
            .setAuthor(member.user!.name, member.user!.id)
            .setColor(Colors.green)
            .setTimestamp()
            .setDescription(stripIndents`<@${isCurrentChannelModmail.openerId}>
                ${content}
            `)
            .setFooter("Moderator");

        const newSentMessage = await message.client.messages.send(isCurrentChannelModmail.userFacingChannelId, {
            embeds: [
                embed
            ],
            isPrivate: true,
        });

        await ctx.prisma.modmailMessage.create({
            data: {
                authorId: message.authorId,
                channelId: message.channelId,
                content,
                modmailThreadId: isCurrentChannelModmail.id,
                sentMessageId: newSentMessage.id,
                originalMessageId: message.id,
            },
        });
        void message.delete().catch(() => null);

        embed.setDescription(content);
        embed.setFooter(`Ticket ${isCurrentChannelModmail.id}`)
        return message.send({
            embeds: [embed],
        });
    },
};

export default Reply;
