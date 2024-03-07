import { ReactionActionType } from "@prisma/client";
import { ReactionInfo } from "@yokilabs/utils";
import { Channel } from "guilded.js";

import { RoleType } from "../../typings";
import { Category, Command } from "../commands";

const SendTrigger: Command = {
    name: "modmail-sendtrigger",
    aliases: ["sendtrigger"],
    subName: "sendtrigger",
    description: "Send a message that can be used to create modmail tickets.",
    // usage: "<channel-id> <emoji>",
    examples: ["#Modmail :smile:"],
    subCommand: true,
    requiredRole: RoleType.MOD,
    category: Category.Modmail,
    args: [
        {
            name: "targetChannel",
            display: "channel",
            type: "channel",
        },
        {
            name: "emoji",
            type: "emote",
        },
    ],
    execute: async (message, args, ctx) => {
        const targetChannel = args.targetChannel as Channel;
        const reaction = args.emoji as ReactionInfo;

        const sentMessage = await ctx.messageUtil.sendInfoBlock(
            targetChannel.id,
            `React here for help!`,
            `React with the :${reaction.name}: emoji on this message to create a support ticket and receive help from the server staff.`
        );
        void ctx.amp.logEvent({
            event_type: "MODMAIL_SEND_TRIGGER",
            user_id: message.authorId,
            event_properties: { serverId: message.serverId! },
        });
        await ctx.reactions.create(targetChannel.id, sentMessage.id, reaction.id);
        await ctx.prisma.reactionAction.create({
            data: {
                actionType: ReactionActionType.MODMAIL,
                channelId: targetChannel.id,
                emoteId: reaction.id,
                messageId: sentMessage.id,
                serverId: message.serverId!,
            },
        });

        return ctx.messageUtil.replyWithSuccess(
            message,
            "Modmail trigger selected",
            `Users will now be able to open a modmail ticket by reacting with a reaction :${reaction.name}:.`
        );
    },
};

export default SendTrigger;
