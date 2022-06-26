import { Embed } from "@guildedjs/embeds";
import type { ChatMessagePayload, EmbedField, EmbedPayload, RESTPostChannelMessagesBody } from "@guildedjs/guilded-api-typings";
import { stripIndents } from "common-tags";

import { Colors } from "../color";
import type { Command, CommandArgument } from "../commands/Command";
import { inlineCode } from "../formatters";
import { BotImages, StateImages } from "../images";
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
            `Sorry, but the usage of argument ${inlineCode(commandArg.name)} was not correct. Was expecting a ${commandArg.type}${
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
                    description,
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
        thumbnail: string | undefined,
        embedPartial?: EmbedPayload,
        messagePartial?: Partial<RESTPostChannelMessagesBody>
    ) {
        return this.sendValueBlock(channelId, title, description, color, { thumbnail: thumbnail ? { url: thumbnail as string } : undefined, ...embedPartial }, messagePartial);
    }

    sendLog(channelId: string, title: string, description: string, color: number, occurred: string, fields?: EmbedField[]) {
        return this.send(channelId, {
            embeds: [
                {
                    title,
                    description,
                    color,
                    fields,
                    timestamp: occurred,
                },
            ],
            isSilent: true,
        });
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
        thumbnail: string | undefined,
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
        return this.replyWithStateBlock(message, title, description, Colors.blockBackground, StateImages.nothingHere, embedPartial, messagePartial);
    }

    replyWithInfo(message: ChatMessagePayload, title: string, description: string, embedPartial?: EmbedPayload, messagePartial?: Partial<RESTPostChannelMessagesBody>) {
        return this.replyWithStateBlock(message, title, description, Colors.blockBackground, undefined, embedPartial, messagePartial);
    }

    replyWithBotInfo(message: ChatMessagePayload, title: string, description: string, embedPartial?: EmbedPayload, messagePartial?: Partial<RESTPostChannelMessagesBody>) {
        return this.send(message.channelId, {
            embeds: [
                {
                    author: {
                        name: `Yoki's ${title}`,
                        icon_url: BotImages.avatar,
                    },
                    description,
                    color: Colors.blockBackground,
                    ...embedPartial,
                },
            ],
            replyMessageIds: [message.id],
            ...messagePartial,
        });
    }

    sendInfoBlock(channelId: string, title: string, description: string, embedPartial?: EmbedPayload, messagePartial?: Partial<RESTPostChannelMessagesBody>) {
        return this.sendStateBlock(channelId, title, description, Colors.blockBackground, undefined, embedPartial, messagePartial);
    }

    // Value blocks
    sendSuccessBlock(channelId: string, title: string, description: string, embedPartial?: EmbedPayload, messagePartial?: Partial<RESTPostChannelMessagesBody>) {
        return this.sendStateBlock(channelId, `:white_check_mark: ${title}`, description, Colors.green, undefined, embedPartial, messagePartial);
    }

    replyWithSuccess(message: ChatMessagePayload, title: string, description: string, embedPartial?: EmbedPayload, messagePartial?: Partial<RESTPostChannelMessagesBody>) {
        return this.replyWithValueBlock(message, `:white_check_mark: ${title}`, description, Colors.green, embedPartial, messagePartial);
    }

    // Special blocks
    replyWithPaginatedContent<T>(info: {
        replyTo: ChatMessagePayload;
        title: string;
        items: T[];
        itemsPerPage: number;
        itemMapping: (item: T) => string | T;
        page?: number;
        embed?: EmbedPayload;
        message?: Partial<RESTPostChannelMessagesBody>;
    }) {
        const { replyTo: message, title, items, itemsPerPage, itemMapping, page: pageOrNull, embed: embedPartial, message: messagePartial } = info;

        const page = pageOrNull ?? 0;

        // Math.ceil(21 / 10) => Math.ceil(2.1) => 3
        const possiblePages = Math.ceil(items.length / itemsPerPage);

        const incrementedPage = page + 1;

        // If there is no such page
        if (incrementedPage > possiblePages)
            return this.replyWithNullState(message, `No items in this page`, `There are no items at page ${inlineCode(incrementedPage)}.`, undefined, messagePartial);

        const startingIndex = itemsPerPage * page;
        const endingIndex = itemsPerPage * incrementedPage;

        return this.replyWithInfo(message, title, items.slice(startingIndex, endingIndex).map(itemMapping).join("\n"), {
            ...embedPartial,
            footer: {
                text: `Page ${incrementedPage}/${possiblePages} ‧ ${items.length} total items`,
            },
        });
    }
}
