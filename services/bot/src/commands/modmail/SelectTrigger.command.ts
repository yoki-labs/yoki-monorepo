import { ReactionActionType } from "@prisma/client";

import { RoleType } from "../../typings";
import { Category } from "../Category";
import type { Command } from "../Command";

const SelectTrigger: Command = {
    name: "modmail-selecttrigger",
    subName: "sendtrigger",
    description: "Select a modmail thread trigger",
    usage: "<channel-id> <message-id> <emote-id>",
    examples: ["17bce2fd-1a95-44b5-abc3-b2ff115c62fb 9fd03b10-c4a1-4c3a-814a-5f6a7b39c632 90002554"],
    subCommand: true,
    requiredRole: RoleType.MOD,
    category: Category.Moderation,
    args: [
        {
            name: "targetChannelId",
            type: "UUID",
        },
        {
            name: "sentMessageId",
            type: "UUID",
        },
        {
            name: "emoteId",
            type: "number",
        },
    ],
    execute: async (message, args, ctx, commandCtx) => {
        if (!commandCtx.server.modmailGroupId)
            return ctx.messageUtil.replyWithError(message, "This server does not have the `modmailgroup` setting set. You can set it using the config command.");
        const targetChannel = await ctx.rest.router
            .getChannel(args.targetChannelId as string)
            .then((x) => x.channel)
            .catch(() => null);
        if (!targetChannel) return ctx.messageUtil.replyWithError(message, "That is not a valid channel ID!");

        const sentMessageId = args.sentMessageId as string;
        const sentMessage = await ctx.rest.router
            .getChannelMessage(targetChannel.id, sentMessageId)
            .then((x) => x.message)
            .catch(() => null);
        if (!sentMessage) return ctx.messageUtil.replyWithError(message, "That is not a valid message!");

        const emoteId = args.emoteId as number;
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
