import type { Role } from "guilded.js";

import type { CommandArgValidator } from "../commands/command-typings";

export default [
    async (input, args, index, message, _, usedMentions): Promise<Role | null> => {
        if (input.startsWith("@")) {
            // Get the mentioned user and increment used mentions
            const mention = message.mentions?.roles?.[usedMentions.user++];
            if (!mention) return null;

            const role = await message.client.roles.fetch(message.serverId!, mention.id).catch(() => null);

            if (!role) return null;

            const { name } = role;
            const spaceCount = name.split(" ").length;

            // If we have `@nico's alt`, remove ` alt` part and modify `@nico's` to be `@nico's alt`
            args.splice(index + 1, spaceCount - 1);

            args[index] = name;

            return role;
        } else if (input.startsWith("<@&") && input.endsWith(">")) {
            const id = input.substring(3, input.length - 1);
            const parsedId = parseInt(id, 10);

            if (id.length === 0 || Number.isNaN(parsedId)) return null;

            return message.client.roles.fetch(message.serverId!, parsedId).catch(() => null);
        }

        const parsed = parseInt(input, 10);

        return Number.isNaN(parsed) ? null : message.client.roles.fetch(message.serverId!, parsed).catch(() => null);
    },
    (_arg) => `
		I was expecting the mention or ID of a role in this server. It may look something like this: \`@role\` or \`28086957\`
		
		Don't know how to get IDs? Refer to this [Guilded Post](https://support.guilded.gg/hc/en-us/articles/6183962129303-Developer-mode#:~:text=Once%20you've%20enabled%20Developer,by%20right%2Dclicking%20on%20it.).
	`,
] satisfies CommandArgValidator;
