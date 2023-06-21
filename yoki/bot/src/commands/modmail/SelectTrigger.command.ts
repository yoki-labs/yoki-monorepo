import { ReactionActionType } from "@prisma/client";
import type { Channel } from "guilded.js";

import { RoleType } from "../../typings";
import { Category, Command } from "../commands";

const SelectTrigger: Command = {
    name: "modmail-selecttrigger",
    subName: "selecttrigger",
    description: "Select a modmail thread trigger.",
    // usage: "<channel-id> <message-id> <emote-id>",
    examples: ["17bce2fd-1a95-44b5-abc3-b2ff115c62fb 9fd03b10-c4a1-4c3a-814a-5f6a7b39c632 90002554"],
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
            name: "emoteId",
            display: "emote ID",
            type: "number",
        },
    ],
    execute: async (message, args, ctx, commandCtx) => {
        if (!commandCtx.server.modmailGroupId && !commandCtx.server.modmailCategoryId)
            return ctx.messageUtil.replyWithError(message, `No modmail group or category set`, "You can set either by using the `?modmail group` or `?modmail category` command.");
        const targetChannel = args.targetChannel as Channel;
        if (!targetChannel) return ctx.messageUtil.replyWithError(message, `Invalid channel`, `That is not a valid channel mention or ID!`);

        const sentMessageId = args.sentMessageId as string;
        const sentMessage = await ctx.messages.fetch(targetChannel.id, sentMessageId)
            .catch(() => null);
        if (!sentMessage) return ctx.messageUtil.replyWithError(message, `Invalid message`, `That is not a valid message!`);

        const emoteId = args.emoteId as number;
        void ctx.amp.logEvent({
            event_type: "MODMAIL_SELECT_TRIGGER",
            user_id: message.authorId,
            event_properties: { serverId: message.serverId! },
        });
        await ctx.prisma.reactionAction.create({
            data: {
                actionType: ReactionActionType.MODMAIL,
                channelId: targetChannel.id,
                emoteId,
                messageId: sentMessage.id,
                serverId: message.serverId!,
            },
        });

        return ctx.messageUtil.replyWithSuccess(
            message,
            "Success!",
            `Users will now be able to open a modmail thread by reacting with a reaction of the emote with an ID of ${emoteId}`
        );
    },
};

export default SelectTrigger;
