import type { Collection } from "@discordjs/collection";
import { Embed } from "@guildedjs/embeds";
import type { EmbedField, EmbedPayload, RESTPostChannelMessagesBody } from "@guildedjs/guilded-api-typings";
import { BotImages, Colors, cutArray, inlineCode, StateImages } from "@yokilabs/util";
import { stripIndents } from "common-tags";
import type { Message } from "guilded.js";

import type AbstractClient from "../Client";
import type { ResolvedArgs } from "../commands/arguments";
import type { BaseCommand, CommandArgType, CommandArgument, CommandArgValidator } from "../commands/command-typings";
import type { IServer } from "../db-types";
import Util from "./util";

export default class MessageUtil<
    TClient extends AbstractClient<TClient, TServer, TCommand>,
    TServer extends IServer,
    TCommand extends BaseCommand<TCommand, TClient, string, TServer>
> extends Util<TClient> {
    createSubCommandFields(subCommands: Collection<string, TCommand>): EmbedField[] {
        const allSubCommands = subCommands.map((x) => `${inlineCode(x.subName!)}\n${x.description}`);

        const [half, otherHalf] = cutArray(allSubCommands);

        return [
            {
                name: "Sub-commands",
                value: half.join("\n\n"),
                inline: true,
            },
            {
                name: "",
                value: otherHalf.join("\n\n"),
                inline: true,
            },
        ];
    }

    createUsageField(command: TCommand, prefix: string, commandPath?: string): EmbedField {
        return {
            name: "Usage",
            value: stripIndents`
                        \`\`\`clojure
                        ${prefix}${commandPath ?? command.name.split("-").join(" ")} ${command.usage}
                        \`\`\`
                    `,
        };
    }

    createExampleField(command: TCommand, prefix: string, commandPath?: string): EmbedField {
        return {
            name: "Example",
            value: stripIndents`
                        \`\`\`md
                        ${prefix}${commandPath ?? command.name.split("-").join(" ")} ${command.examples ? command.examples[0] : ""}
                        \`\`\`
                    `,
        };
    }

    // Send a message using either string, embed object, or raw object
    send(channelId: string, content: string | RESTPostChannelMessagesBody | Embed) {
        return this.client.messages.send(channelId, content instanceof Embed ? { embeds: [content.toJSON()] } : typeof content === "string" ? { content } : content);
    }

    // Reply to a message
    reply(message: Message, content: string | RESTPostChannelMessagesBody) {
        const opts: RESTPostChannelMessagesBody | string = typeof content === "string" ? { replyMessageIds: [message.id], content } : content;
        return this.client.messages.send(message.channelId, opts);
    }

    handleBadArg(message: Message, prefix: string, commandArg: CommandArgument, command: TCommand, argumentConverters: Record<CommandArgType, CommandArgValidator>, castArg: ResolvedArgs) {
        const [, invalidStringGenerator] = argumentConverters[commandArg.type];

        return this.replyWithError(
            message,
            "Incorrect Command Usage",
            stripIndents`
                For the argument \`${commandArg.name}\`, ${stripIndents(invalidStringGenerator(commandArg, castArg?.toString()))}
            
                _Need more help? [Join our support server](https://guilded.gg/Yoki)_
            `,
            {
                fields: [this.createUsageField(command, prefix)],
            }
        );
    }

    sendEmbed(channelId: string, embed: EmbedPayload, messagePartial?: Partial<RESTPostChannelMessagesBody>) {
        return this.send(channelId, {
            ...messagePartial,
            embeds: [embed],
        });
    }

    sendLog({
        where,
        title,
        description,
        color,
        occurred,
        additionalInfo,
        fields,
    }: {
        where: string;
        title: string;
        description: string;
        color: number;
        occurred: string;
        additionalInfo?: string;
        fields?: EmbedField[];
    }) {
        return this.send(where, {
            embeds: [
                {
                    title,
                    description,
                    color,
                    fields: additionalInfo ? (fields ?? []).concat({ name: "Additional Info", value: additionalInfo }) : fields,
                    timestamp: occurred,
                },
            ],
            isSilent: true,
        });
    }

    replyWithEmbed(message: Message, embed: EmbedPayload, messagePartial?: Partial<RESTPostChannelMessagesBody>) {
        return this.sendEmbed(message.channelId, embed, { replyMessageIds: [message.id], ...messagePartial });
    }

    // State blocks
    replyWithError(message: Message, title: string, description: string, embedPartial?: EmbedPayload, messagePartial?: Partial<RESTPostChannelMessagesBody>) {
        return this.replyWithEmbed(
            message,
            {
                author: { name: title, icon_url: BotImages.crossmark },
                description,
                color: Colors.red,
                thumbnail: { url: StateImages.notFound },
                ...embedPartial,
            },
            messagePartial
        );
    }

    replyWithUnexpected(message: Message, description: string, embedPartial?: EmbedPayload, messagePartial?: Partial<RESTPostChannelMessagesBody>) {
        return this.replyWithEmbed(
            message,
            {
                author: { name: `Oh no, something went wrong!`, icon_url: BotImages.crossmark },
                description,
                color: Colors.red,
                thumbnail: { url: StateImages.error },
                ...embedPartial,
            },
            messagePartial
        );
    }

    replyWithUnpermitted(message: Message, description: string, embedPartial?: EmbedPayload, messagePartial?: Partial<RESTPostChannelMessagesBody>) {
        return this.replyWithEmbed(
            message,
            {
                author: { name: `Can't do that!`, icon_url: BotImages.crossmark },
                description,
                color: Colors.red,
                thumbnail: { url: StateImages.stop },
                ...embedPartial,
            },
            messagePartial
        );
    }

    replyWithNullState(message: Message, title: string, description: string, embedPartial?: EmbedPayload, messagePartial?: Partial<RESTPostChannelMessagesBody>) {
        return this.replyWithEmbed(
            message,
            {
                title: `:grey_question: ${title}`,
                description,
                color: Colors.blockBackground,
                thumbnail: { url: StateImages.nothingHere },
                ...embedPartial,
            },
            messagePartial
        );
    }

    replyWithInfo(message: Message, title: string, description: string, embedPartial?: EmbedPayload, messagePartial?: Partial<RESTPostChannelMessagesBody>) {
        return this.replyWithEmbed(
            message,
            {
                title,
                description,
                color: Colors.blockBackground,
                ...embedPartial,
            },
            messagePartial
        );
    }

    replyWithBotInfo(message: Message, title: string, description: string, embedPartial?: EmbedPayload, messagePartial?: Partial<RESTPostChannelMessagesBody>) {
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

    sendWarningBlock(channelId: string, title: string, description: string, embedPartial?: EmbedPayload, messagePartial?: Partial<RESTPostChannelMessagesBody>) {
        return this.sendEmbed(
            channelId,
            {
                title,
                description,
                color: Colors.yellow,
                thumbnail: { url: StateImages.stop },
                ...embedPartial,
            },
            messagePartial
        );
    }

    sendErrorBlock(channelId: string, title: string, description: string, embedPartial?: EmbedPayload, messagePartial?: Partial<RESTPostChannelMessagesBody>) {
        return this.sendEmbed(
            channelId,
            {
                author: { name: title, icon_url: BotImages.crossmark },
                description,
                color: Colors.red,
                thumbnail: { url: StateImages.notFound },
                ...embedPartial,
            },
            messagePartial
        );
    }

    sendInfoBlock(channelId: string, title: string, description: string, embedPartial?: EmbedPayload, messagePartial?: Partial<RESTPostChannelMessagesBody>) {
        return this.sendEmbed(
            channelId,
            {
                title,
                description,
                color: Colors.blockBackground,
                ...embedPartial,
            },
            messagePartial
        );
    }

    // Value blocks
    sendSuccessBlock(channelId: string, title: string, description: string, embedPartial?: EmbedPayload, messagePartial?: Partial<RESTPostChannelMessagesBody>) {
        return this.sendEmbed(
            channelId,
            {
                author: { name: title, icon_url: BotImages.checkmark },
                description,
                color: Colors.green,
                ...embedPartial,
            },
            messagePartial
        );
    }

    replyWithSuccess(message: Message, title: string, description: string, embedPartial?: EmbedPayload, messagePartial?: Partial<RESTPostChannelMessagesBody>) {
        return this.replyWithEmbed(
            message,
            {
                author: { name: title, icon_url: BotImages.checkmark },
                description,
                color: Colors.green,
                ...embedPartial,
            },
            messagePartial
        );
    }

    // Special blocks
    replyWithPaginatedContent<T>(info: {
        replyTo: Message;
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

        return this.replyWithInfo(
            message,
            title,
            items.slice(startingIndex, endingIndex).map(itemMapping).join("\n"),
            {
                ...embedPartial,
                footer: {
                    text: `Page ${incrementedPage}/${possiblePages} • ${items.length} total items`,
                },
            },
            messagePartial
        );
    }

    replyWithEnableStateList(message: Message, title: string, enabledItems: string[], allItems: string[], descriptions: Record<string, string>) {
        const itemDisplays = allItems.map((item) => {
            const formattedItem = `\`${item}\``;
            const itemWithState = enabledItems.includes(item) ? `:white_check_mark: **${formattedItem}**` : formattedItem;
            return `${itemWithState}\n${descriptions[item]}`;
        });

        const [half, otherHalf] = cutArray(itemDisplays);

        return this.replyWithEmbed(message, {
            color: Colors.blockBackground,
            fields: [
                {
                    name: title,
                    value: half.join("\n\n"),
                    inline: true,
                },
                {
                    name: "",
                    value: otherHalf.join("\n\n"),
                    inline: true,
                },
            ],
        });
    }
}
