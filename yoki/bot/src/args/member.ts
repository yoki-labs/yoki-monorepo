import type { CommandArgValidator } from "../commands/Command";
import type { CachedMember } from "../typings";
import { isHashId } from "../utils/matching";

export default [async (
	input,
	args,
	index,
	message,
	_,
	usedMentions
): Promise<CachedMember | null> => {
	if (input.startsWith("@")) {
		// Get the mentioned user and increment used mentions
		const mention = message.mentions?.users?.[usedMentions.user++];
		if (!mention) return null;

		const member = await message.client.members.fetch(message.serverId!, mention.id).catch(() => null);
		if (!member) return null;

		const name = member.nickname ?? member.user!.name;
		const spaceCount = name.split(" ").length;

		// If we have `@nico's alt`, remove ` alt` part and modify `@nico's` to be `@nico's alt`
		args.splice(index + 1, spaceCount - 1);

		args[index] = name;

		return member;
	} else if (isHashId(input)) {
		return message.client.members.fetch(message.serverId!, input).catch(() => null) ?? null;
	}

	return null;
}, (_arg) => `
		I was expecting a mention or ID of a user. 
		
		This user **must** currently be in the server.
	`]satisfies CommandArgValidator;
