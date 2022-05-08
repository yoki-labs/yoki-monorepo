import { Embed } from "@guildedjs/embeds";
import type { ChatMessagePayload, EmbedPayload, RESTPostChannelMessagesBody } from "@guildedjs/guilded-api-typings";
import { stripIndents } from "common-tags";

import { Colors } from "../color";
import type { Command, CommandArgument } from "../commands/Command";
import { Util } from "./util";

export class MessageUtil extends Util {
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
        return this.sendCautionBlock(
            channelId,
            "Incorrect argument",
            `Sorry, but the usage of argument \`${commandArg.name}\` was not correct. Was expecting a ${commandArg.type}.`,
            {
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
            }
        );
    }

    sendThemedBlock(channelId: string, title: string, description: string, color: number, embedPartial?: EmbedPayload, messagePartial?: Partial<RESTPostChannelMessagesBody>) {
        return this.send(channelId, {
            ...messagePartial,
            embeds: [
                {
                    title,
                    description,
                    color,
                    ...embedPartial,
                },
            ],
        });
    }

    sendCautionBlock(channelId: string, title: string, description: string, embedPartial?: EmbedPayload, messagePartial?: Partial<RESTPostChannelMessagesBody>) {
        return this.sendThemedBlock(channelId, `:x: ${title}`, description, Colors.red, embedPartial, messagePartial);
    }

    sendWarningBlock(channelId: string, title: string, description: string, embedPartial?: EmbedPayload, messagePartial?: Partial<RESTPostChannelMessagesBody>) {
        return this.sendThemedBlock(channelId, `:warning: ${title}`, description, Colors.yellow, embedPartial, messagePartial);
    }

    sendNullBlock(channelId: string, title: string, description: string, embedPartial?: EmbedPayload, messagePartial?: Partial<RESTPostChannelMessagesBody>) {
        return this.sendThemedBlock(channelId, `:shrug_gil: ${title}`, description, Colors.dull, embedPartial, messagePartial);
    }

    sendContentBlock(channelId: string, title: string, description: string, embedPartial?: EmbedPayload, messagePartial?: Partial<RESTPostChannelMessagesBody>) {
        return this.sendThemedBlock(channelId, `:scroll: ${title}`, description, Colors.pink, embedPartial, messagePartial);
    }

    sendInfoBlock(channelId: string, title: string, description: string, embedPartial?: EmbedPayload, messagePartial?: Partial<RESTPostChannelMessagesBody>) {
        return this.sendThemedBlock(channelId, `:information_source: ${title}`, description, Colors.blue, embedPartial, messagePartial);
    }

    sendSuccessBlock(channelId: string, title: string, description: string, embedPartial?: EmbedPayload, messagePartial?: Partial<RESTPostChannelMessagesBody>) {
        return this.sendThemedBlock(channelId, `:white_check_mark: ${title}`, description, Colors.green, embedPartial, messagePartial);
    }
}
