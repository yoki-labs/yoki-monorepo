import type { WSChatMessageCreatedPayload } from "@guildedjs/guilded-api-typings";

import type { CommandArgValidator } from "../commands/Command";
import type { Context, UsedMentions } from "../typings";
import { isUUID } from "../utils/matching";

export default [async (input: string, args: string[], index: number, ctx: Context, packet: WSChatMessageCreatedPayload, __, usedMentions: UsedMentions) => {
	if (input.startsWith("#")) {
		// Get the mentioned user and increment used mentions
		const mention = packet.d.message.mentions?.channels?.[usedMentions.channel++];
		if (!mention) return null;

		const channel = await ctx.rest.router.getChannel(mention.id).catch(() => null);
		if (!channel) return null;

		const { name } = channel.channel;
		const spaceCount = name.split(" ").length;

		// [..., "#super", "cool", "channel", ...] => [..., "#super cool channel", ...]
		args.splice(index + 1, spaceCount - 1);

		args[index] = name;

		return channel.channel;
	} else if (isUUID(input)) {
		return ctx.rest.router
			.getChannel(input)
			.then((x) => x.channel)
			.catch(() => null);
	}

	return null;
}, (_arg) => `
	I was expecting either a mention or ID of a channel.

	**The bot must have read/send/manage permission on the channel**.
	Ensure that **none** of the roles the bot has denies it any of these permissions, otherwise it will not be able to see the channel.
`]satisfies CommandArgValidator;
