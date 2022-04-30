import { Embed } from "@guildedjs/embeds";
import type { ChatMessagePayload, RESTPostChannelMessagesBody } from "@guildedjs/guilded-api-typings";
import { stripIndents } from "common-tags";

import type { Command, CommandArgument } from "../commands/Command";
import { Util } from "./util";

export class MessageUtil extends Util {
    readonly colors = {
        default: 0xeb6fa7,
        good: 0x36ec36,
        info: 0x3636ec,
        warn: 0xec9b36,
        bad: 0xec3636,
        dull: 0x8a7b82,
    };

    // Send a message using either string, embed object, or raw object
    send(channelId: string, content: string | RESTPostChannelMessagesBody | Embed) {
        return this.rest.router
            .createChannelMessage(channelId, content instanceof Embed ? { embeds: [content.toJSON()] } : typeof content === "string" ? { content } : content)
            .then((x) => x.message);
    }

    // Reply to a message
    reply(message: ChatMessagePayload, content: string | RESTPostChannelMessagesBody) {
        const opts: RESTPostChannelMessagesBody | string = typeof content === "string" ? { replyMessageIds: [message.id], content } : content;
        return this.rest.router.createChannelMessage(message.channelId, opts);
    }

    handleBadArg(channelId: string, prefix: string, commandArg: CommandArgument, command: Command, parentCommand: Command) {
        return this.send(
            channelId,
            new Embed({
                title: ":x: Incorrect argument",
                description: `Sorry, but the usage of argument \`${commandArg.name}\` was not correct. Was expecting a ${commandArg.type}.`,
                color: this.colors.bad,
                fields: [
                    {
                        name: "Usage",
                        value: stripIndents`
                                \`\`\`clojure
                                ${prefix}${parentCommand.name}${command.name === parentCommand.name ? "" : ` ${command.subName ?? command.name}`} ${command.usage}
                                \`\`\`
                            `,
                    },
                ],
            })
        );
    }
}
