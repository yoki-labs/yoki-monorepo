import { Embed } from "@guildedjs/embeds";
import type { ChatMessagePayload, EmbedPayload, RESTPostChannelMessagesBody } from "@guildedjs/guilded-api-typings";
import { stripIndents } from "common-tags";

import { Colors } from "../color";
import type { Command, CommandArgument } from "../commands/Command";
import { StateImages } from "../images";
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

    handleBadArg(message: ChatMessagePayload, prefix: string, commandArg: CommandArgument, command: Command, parentCommand: Command) {
        return this.replyWithAlert(
            message,
            `Incorrect argument`,
            `Sorry, but the usage of argument \`${commandArg.name}\` was not correct. Was expecting a ${commandArg.type}${
                commandArg.max ? ` with the limit of ${commandArg.max}` : ""
            }.`,
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

    sendValueBlock(channelId: string, title: string, description: string, color: number, embedPartial?: EmbedPayload, messagePartial?: Partial<RESTPostChannelMessagesBody>) {
        return this.send(channelId, {
            ...messagePartial,
            embeds: [
                {
                    title,
                    description: stripIndents`${description}`,
                    color,
                    ...embedPartial,
                },
            ],
        });
    }

    sendStateBlock(
        channelId: string,
        title: string,
        description: string,
        color: number,
        thumbnail: string,
        embedPartial?: EmbedPayload,
        messagePartial?: Partial<RESTPostChannelMessagesBody>
    ) {
        return this.sendValueBlock(channelId, title, description, color, { thumbnail: { url: thumbnail }, ...embedPartial }, messagePartial);
    }

    replyWithValueBlock(
        message: ChatMessagePayload,
        title: string,
        description: string,
        color: number,
        embedPartial?: EmbedPayload,
        messagePartial?: Partial<RESTPostChannelMessagesBody>
    ) {
        return this.sendValueBlock(message.channelId, title, description, color, embedPartial, { replyMessageIds: [message.id], ...messagePartial });
    }

    replyWithStateBlock(
        message: ChatMessagePayload,
        title: string,
        description: string,
        color: number,
        thumbnail: string,
        embedPartial?: EmbedPayload,
        messagePartial?: Partial<RESTPostChannelMessagesBody>
    ) {
        return this.sendStateBlock(message.channelId, title, description, color, thumbnail, embedPartial, { replyMessageIds: [message.id], ...messagePartial });
    }

    // State blocks
    replyWithAlert(message: ChatMessagePayload, title: string, description: string, embedPartial?: EmbedPayload, messagePartial?: Partial<RESTPostChannelMessagesBody>) {
        return this.replyWithStateBlock(message, title, description, Colors.orangeRed, StateImages.notFound, embedPartial, messagePartial);
    }

    replyWithError(message: ChatMessagePayload, description: string, embedPartial?: EmbedPayload, messagePartial?: Partial<RESTPostChannelMessagesBody>) {
        return this.replyWithStateBlock(message, `Oh no, something went wrong!`, description, Colors.red, StateImages.error, embedPartial, messagePartial);
    }

    replyWithUnpermitted(message: ChatMessagePayload, description: string, embedPartial?: EmbedPayload, messagePartial?: Partial<RESTPostChannelMessagesBody>) {
        return this.replyWithStateBlock(message, `Can't do that!`, description, Colors.red, StateImages.stop, embedPartial, messagePartial);
    }

    sendWarningBlock(channelId: string, title: string, description: string, embedPartial?: EmbedPayload, messagePartial?: Partial<RESTPostChannelMessagesBody>) {
        return this.sendStateBlock(channelId, title, description, Colors.yellow, StateImages.stop, embedPartial, messagePartial);
    }

    replyWithNullState(message: ChatMessagePayload, title: string, description: string, embedPartial?: EmbedPayload, messagePartial?: Partial<RESTPostChannelMessagesBody>) {
        return this.replyWithStateBlock(message, title, description, Colors.dull, StateImages.nothingHere, embedPartial, messagePartial);
    }

    replyWithContent(message: ChatMessagePayload, title: string, description: string, embedPartial?: EmbedPayload, messagePartial?: Partial<RESTPostChannelMessagesBody>) {
        return this.replyWithStateBlock(message, title, description, Colors.pink, StateImages.scroll, embedPartial, messagePartial);
    }

    sendInfoBlock(channelId: string, title: string, description: string, embedPartial?: EmbedPayload, messagePartial?: Partial<RESTPostChannelMessagesBody>) {
        return this.sendStateBlock(channelId, title, description, Colors.blue, StateImages.scroll, embedPartial, messagePartial);
    }

    replyWithInfo(message: ChatMessagePayload, title: string, description: string, embedPartial?: EmbedPayload, messagePartial?: Partial<RESTPostChannelMessagesBody>) {
        return this.replyWithStateBlock(message, title, description, Colors.blue, StateImages.scroll, embedPartial, messagePartial);
    }

    // Value blocks
    replyWithDisabledState(message: ChatMessagePayload, title: string, description: string, embedPartial?: EmbedPayload, messagePartial?: Partial<RESTPostChannelMessagesBody>) {
        return this.replyWithValueBlock(message, `:no_entry: ${title}`, description, Colors.dullRed, embedPartial, messagePartial);
    }

    replyWithSuccess(message: ChatMessagePayload, title: string, description: string, embedPartial?: EmbedPayload, messagePartial?: Partial<RESTPostChannelMessagesBody>) {
        return this.replyWithValueBlock(message, `:white_check_mark: ${title}`, description, Colors.green, embedPartial, messagePartial);
    }

    // Special blocks
    replyWithPaginatedContent(
        message: ChatMessagePayload,
        title: string,
        items: string[],
        itemsPerPage: number,
        page = 0,
        embedPartial?: EmbedPayload,
        messagePartial?: Partial<RESTPostChannelMessagesBody>
    ) {
        // Math.ceil(21 / 10) => Math.ceil(2.1) => 3
        const possiblePages = Math.ceil(items.length / itemsPerPage);

        const incrementedPage = page + 1;

        // If there is no such page
        if (incrementedPage > possiblePages) return this.replyWithNullState(message, `No items in this page`, `There are no items at page \`${page}\`.`, undefined, messagePartial);

        const startingIndex = itemsPerPage * page;
        const endingIndex = itemsPerPage * incrementedPage;

        return this.replyWithContent(message, title, items.slice(startingIndex, endingIndex).join("\n"), {
            ...embedPartial,
            footer: {
                text: `Page ${incrementedPage}/${possiblePages}`,
            },
        });
    }
}
