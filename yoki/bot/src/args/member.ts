import type { WSChatMessageCreatedPayload } from "@guildedjs/guilded-api-typings";

import type { CommandArgValidator } from "../commands/Command";
import type { CachedMember, Context, UsedMentions } from "../typings";
import { isHashId } from "../utils/matching";

export default [async (
	input: string,
	args: string[],
	index: number,
	ctx: Context,
	packet: WSChatMessageCreatedPayload,
	___,
	usedMentions: UsedMentions
): Promise<CachedMember | null> => {
	if (input.startsWith("@")) {
		// Get the mentioned user and increment used mentions
		const mention = packet.d.message.mentions?.users?.[usedMentions.user++];
		if (!mention) return null;

		const member = await ctx.serverUtil.getMember(packet.d.serverId, mention.id).catch(() => null);
		if (!member) return null;

		const name = member.nickname ?? member.user.name;
		const spaceCount = name.split(" ").length;

		// If we have `@nico's alt`, remove ` alt` part and modify `@nico's` to be `@nico's alt`
		args.splice(index + 1, spaceCount - 1);

		args[index] = name;

		return member;
	} else if (isHashId(input)) {
		return ctx.serverUtil.getMember(packet.d.serverId, input).catch(() => null) ?? null;
	}

	return null;
}, (_arg) => "I was expecting a mention or ID of a user. This user **must** currently be in the server."]satisfies CommandArgValidator;
