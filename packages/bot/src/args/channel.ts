import { isUUID } from "@yokilabs/utils";

import type { CommandArgValidator } from "../commands/command-typings";

export default [
    async (input, _args, _index, message, __, _usedMentions) => {
        // if (input.startsWith("#")) {
        //     // Get the mentioned user and increment used mentions
        //     const mention = message.mentions?.channels?.[usedMentions.channel++];
        //     if (!mention) return null;

        //     const channel = await message.client.channels.fetch(mention.id).catch(() => null);
        //     if (!channel) return null;

        //     const { name } = channel;
        //     const spaceCount = name.split(" ").length;

        //     // [..., "#super", "cool", "channel", ...] => [..., "#super cool channel", ...]
        //     args.splice(index + 1, spaceCount - 1);

        //     args[index] = name;

        //     return channel;
        // }
        if (input.startsWith("<#") && input.endsWith(">")) {
            const id = input.substring(2, input.length - 1);

            if (!isUUID(id)) return null;

            return message.client.channels.fetch(id).catch(() => null);
        } else if (isUUID(input)) {
            return message.client.channels.fetch(input).catch(() => null);
        }

        return null;
    },
    (_arg) => `
	I was expecting either a mention or ID of a channel. I received either an incorrect input, or I cannot find the specified channel.

	**The bot must have read, send, & manage permission on the channel**
	
	Ensure **none** of the bot's roles deny these permissions.
    
    Don't know how to get IDs? Refer to this [Guilded Post](https://support.guilded.gg/hc/en-us/articles/6183962129303-Developer-mode#:~:text=Once%20you've%20enabled%20Developer,by%20right%2Dclicking%20on%20it.).
`,
] satisfies CommandArgValidator;
