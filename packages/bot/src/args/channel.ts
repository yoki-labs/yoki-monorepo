import type { CommandArgValidator } from "../commands/command-typings";
import { isUUID } from "../utils/value";

export default [
    async (input, args, index, message, __, usedMentions) => {
        if (input.startsWith("#")) {
            // Get the mentioned user and increment used mentions
            const mention = message.mentions?.channels?.[usedMentions.channel++];
            if (!mention) return null;

            const channel = await message.client.channels.fetch(mention.id).catch(() => null);
            if (!channel) return null;

            const { name } = channel;
            const spaceCount = name.split(" ").length;

            // [..., "#super", "cool", "channel", ...] => [..., "#super cool channel", ...]
            args.splice(index + 1, spaceCount - 1);

            args[index] = name;

            return channel;
        }

        if (isUUID(input)) {
            return message.client.channels.fetch(input).catch(() => null);
        }

        return null;
    },
    (_arg) => `
	I was expecting either a mention or ID of a channel. I received either an incorrect input, or I cannot find the specified channel.

	**The bot must have read, send, & manage permission on the channel**
	
	Ensure **none** of the bot's roles deny these permissions.
`,
] satisfies CommandArgValidator;
