import { ReactionActionType } from "@prisma/client";
import { channelName, inlineQuote } from "@yokilabs/bot";
import { ReactionInfo } from "@yokilabs/utils";
import type { Channel } from "guilded.js";

import { RoleType } from "../../typings";
import { Category, Command } from "../commands";

const SetTrigger: Command = {
    name: "modmail-settrigger",
    subName: "settrigger",
    description: "Select a message that can be used to create modmail tickets.",
    aliases: ["selecttrigger"],
    // usage: "<channel-id> <message-id> <emote-id>",
    examples: ["#Modmail 9fd03b10-c4a1-4c3a-814a-5f6a7b39c632 :smile:"],
    subCommand: true,
    requiredRole: RoleType.MOD,
    category: Category.Modmail,
    args: [
        {
            name: "targetChannel",
            display: "message's channel",
            type: "channel",
        },
        {
            name: "sentMessageId",
            display: "message ID",
            type: "UUID",
        },
        {
            name: "emote",
            type: "emote",
        },
    ],
    execute: async (message, args, ctx) => {
        const targetChannel = args.targetChannel as Channel;
        const sentMessageId = args.sentMessageId as string;

        const sentMessage = await ctx.messages.fetch(targetChannel.id, sentMessageId).catch(() => null);
        if (!sentMessage)
            return ctx.messageUtil.replyWithError(
                message,
                `Invalid message`,
                `No such message by ID ${inlineQuote(sentMessageId)} exists in channel ${channelName(
                    targetChannel.name,
                    targetChannel.serverId,
                    targetChannel.groupId,
                    targetChannel.id
                )}.`
            );

        const emote = args.emote as ReactionInfo;

        void ctx.amp.logEvent({
            event_type: "MODMAIL_SELECT_TRIGGER",
            user_id: message.authorId,
            event_properties: { serverId: message.serverId! },
        });

        // Since it can already exist and we might need to modify it
        const reactionTrigger = await ctx.prisma.reactionAction.findFirst({
            where: {
                actionType: ReactionActionType.MODMAIL,
                serverId: message.serverId!,
            },
        });

        if (reactionTrigger)
            await ctx.prisma.reactionAction.updateMany({
                where: {
                    actionType: ReactionActionType.MODMAIL,
                    serverId: message.serverId!,
                },
                data: {
                    channelId: targetChannel.id,
                    emoteId: emote.id,
                    messageId: sentMessage.id,
                    serverId: message.serverId!,
                },
            });
        else
            await ctx.prisma.reactionAction.create({
                data: {
                    actionType: ReactionActionType.MODMAIL,
                    channelId: targetChannel.id,
                    emoteId: emote.id,
                    messageId: sentMessage.id,
                    serverId: message.serverId!,
                },
            });

        return ctx.messageUtil.replyWithSuccess(
            message,
            "Modmail trigger selected",
            `Users will now be able to open a modmail ticket by reacting with a reaction :${emote.name}:.`
        );
    },
};

export default SetTrigger;
