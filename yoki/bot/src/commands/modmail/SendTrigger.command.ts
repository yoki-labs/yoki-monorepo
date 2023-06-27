import { ReactionActionType } from "@prisma/client";
import { ReactionInfo } from "@yokilabs/utils";
import { Channel } from "guilded.js";

import { RoleType } from "../../typings";
import { Category, Command } from "../commands";

const SendTrigger: Command = {
    name: "modmail-sendtrigger",
    aliases: ["sendtrigger"],
    subName: "sendtrigger",
    description: "Send a modmail thread trigger.",
    // usage: "<channel-id> <emoji>",
    examples: ["17bce2fd-1a95-44b5-abc3-b2ff115c62fb :smile:"],
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
    execute: async (message, args, ctx, commandCtx) => {
        if (!commandCtx.server.modmailGroupId && !commandCtx.server.modmailCategoryId)
            return ctx.messageUtil.replyWithError(message, `No modmail group or category set`, "You can set either by using the `?modmail group` or `?modmail category` command.");
        const targetChannel = args.targetChannel as Channel;
        const reaction = args.emoji as ReactionInfo;

        const sentMessage = await ctx.messageUtil.sendInfoBlock(
            targetChannel.id,
            `React here for help!`,
            `React with the :${reaction.name}: emoji on this message to create a support ticket and receive help from server staff.`
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

        return ctx.messageUtil.replyWithSuccess(message, "Success!", `Users will now be able to open a modmail thread by reacting with the :${reaction.name}: emoji.`);
    },
};

export default SendTrigger;
