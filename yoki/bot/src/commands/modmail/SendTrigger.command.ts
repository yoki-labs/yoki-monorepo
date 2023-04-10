import { ReactionActionType } from "@prisma/client";
import { Channel, Embed } from "guilded.js";

import reactions from "../../static/reactions.json";
import { RoleType } from "../../typings";
import { Command, Category } from "../commands";

const SendTrigger: Command = {
	name: "modmail-sendtrigger",
	aliases: ["sendtrigger"],
	subName: "sendtrigger",
	description: "Send a modmail thread trigger.",
	usage: "<channel-id> <emoji>",
	examples: ["17bce2fd-1a95-44b5-abc3-b2ff115c62fb :smile:"],
	subCommand: true,
	requiredRole: RoleType.MOD,
	category: Category.Modmail,
	args: [
		{
			name: "targetChannel",
			type: "channel",
		},
		{
			name: "emoji",
			type: "string",
		},
	],
	execute: async (message, args, ctx, commandCtx) => {
		if (!commandCtx.server.modmailGroupId && !commandCtx.server.modmailCategoryId)
			return ctx.messageUtil.replyWithError(
				message,
				`No modmail group or category set`,
				"You can set either by using the `?modmail group` or `?modmail category` command."
			);
		const targetChannel = args.targetChannel as Channel;
		const reaction = (args.emoji as string).trim();

		if (!reaction.startsWith(":") && reaction.endsWith(":")) return ctx.messageUtil.replyWithError(message, "Invalid emoji", "Could not detect a valid emoji in your message.");
		const resolvedEmoji = reactions[reaction.slice(1, reaction.length - 1)];
		if (!resolvedEmoji)
			return ctx.messageUtil.replyWithError(
				message,
				"Could not resolve emoji",
				"Could not resolve that to a proper emoji. Please ensure that you are passing a unicode emoji."
			);
		const sentMessage = await ctx.messageUtil.send(
			targetChannel.id,
			new Embed().setTitle("React here for help!").setDescription(`React with the :${reaction}: emoji to this message to get in touch with server staff!`).setColor("GREEN")
		);
		void ctx.amp.logEvent({
			event_type: "MODMAIL_SEND_TRIGGER",
			user_id: message.authorId,
			event_properties: { serverId: message.serverId! },
		});
		await ctx.reactions.create(targetChannel.id, sentMessage.id, resolvedEmoji);
		await ctx.prisma.reactionAction.create({
			data: {
				actionType: ReactionActionType.MODMAIL,
				channelId: targetChannel.id,
				emoteId: Number.parseInt(resolvedEmoji, 10),
				messageId: sentMessage.id,
				serverId: message.serverId!,
			},
		});

		return ctx.messageUtil.replyWithSuccess(message, "Success!", `Users will now be able to open a modmail thread by reacting with the :${reaction}: emoji.`);
	},
};

export default SendTrigger;
