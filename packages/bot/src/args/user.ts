import { isHashId } from "@yokilabs/utils";
import { Client, User } from "guilded.js";

import type { CommandArgValidator } from "../commands/command-typings";
import { GuildedClientUserProfile } from "../guilded-types";
import { stringifyParagraph } from "../utils/rich";

export default [
    async (input, args, index, message, _, usedMentions, client): Promise<User | null> => {
        // The mention was provided
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

            return member.user;
        }
        // At least the ID was provided
        else if (isHashId(input)) {
            return client.clientApiRest.get(`/users/${input}`)
                .then((payload) => normalizeUser(message.client, payload.user as GuildedClientUserProfile))
                .catch(() => null);
        }

        return null;
    },
    (_arg) => `
		I was expecting a mention or ID of a user. 

		Don't know how to get IDs? Refer to this [Guilded Post](https://support.guilded.gg/hc/en-us/articles/6183962129303-Developer-mode#:~:text=Once%20you've%20enabled%20Developer,by%20right%2Dclicking%20on%20it.).
	`,
] satisfies CommandArgValidator;

function normalizeUser(client: Client, { id, type, name, profilePicture, profileBanner, createdAt, userStatus }: GuildedClientUserProfile) {
    return new User(client, {
        id,
        name,
        type: type,
        avatar: profilePicture,
        banner: profileBanner,
        status: userStatus?.customReactionId
            ? { emoteId: userStatus.customReactionId, content: userStatus.content ? stringifyParagraph(userStatus.content.document.nodes[0]) : undefined }
            : undefined,
        createdAt
    });
}