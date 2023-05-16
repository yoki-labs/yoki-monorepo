import { isHashId } from "../utils/value";
import type { Member } from "guilded.js";

import type { CommandArgValidator } from "../commands/command-typings";

export default [
    async (input, args, index, message, _, usedMentions): Promise<Member | null> => {
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
        }

        if (isHashId(input)) {
            return message.client.members.fetch(message.serverId!, input).catch(() => null);
        }

        return null;
    },
    (_arg) => `
		I was expecting a mention or ID of a user. 
		
		This user **must** currently be in the server.
	`,
] satisfies CommandArgValidator;
