import type { Collection } from "@discordjs/collection";
import type { EmbedField, EmbedPayload, RestBody, RestPath } from "@guildedjs/guilded-api-typings";
import { BotImages, Colors, cutArray, cutArrayOddEven, StateImages } from "@yokilabs/utils";
import { stripIndents } from "common-tags";
import { Embed, Message, MessageContent } from "guilded.js";

import type { AbstractClient } from "../Client";
import type { BaseCommand, CommandArgument } from "../commands/command-typings";
import type { IServer } from "../db-types";
import { inlineCode, listInlineCode } from "../utils/formatting";
import { Util } from "./util";

type MessageBody = Omit<RestBody<RestPath<"/channels/{channelId}/messages">["post"]>, "embeds" | "content"> & { embeds?: Embed[]; content?: string };

const argumentOptionalityBraces = [
    // Mandatory
    ["<", ">"],
    // Optional
    ["[", "]"],
];

export class MessageUtil<
    TClient extends AbstractClient<TClient, TServer, TCommand>,
    TServer extends IServer,
    TCommand extends BaseCommand<TCommand, TClient, string, TServer>
> extends Util<TClient> {
    // #region Help and Commands
    createSubCommandFields(subCommands: Collection<string, TCommand>): EmbedField[] {
        const allSubCommands = subCommands.map((x) => `${inlineCode(x.subName!)}\n${x.description}`);

        const [half, otherHalf] = cutArrayOddEven(allSubCommands);

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
                        ${prefix}${commandPath ?? command.name.split("-").join(" ")} ${this.createCommandUsage(command)}
                        \`\`\`
                    `,
        };
    }

    createCommandUsage(command: TCommand): string {
        // Take each arg, and based on whether it's optional (0 if mandatory, 1 if optional), take an array with braces and join it with argument's name
        return command.args?.map((x) => argumentOptionalityBraces[Number(x.optional ?? false)].join(`${x.type === "rest" ? "..." : ""}${x.display ?? x.name}`))?.join(" ") ?? "";
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

    handleBadArg(
        message: Message,
        prefix: string,
        commandArg: CommandArgument,
        command: TCommand,
        additionalMessage: string,
        // argumentConverters: Record<CommandArgType, CommandArgValidator>,
        // castArg: ResolvedArgs
    ) {
        // const [, invalidStringGenerator] = argumentConverters[commandArg.type];

        return this.replyWithError(
            message,
            "Incorrect Command Usage",
            stripIndents`
                For the argument \`${commandArg.name}\`, ${additionalMessage}
            
                _Need more help? [Join our support server](https://guilded.gg/Yoki)_
            `,
            {
                fields: [this.createUsageField(command, prefix)],
            }
        );
    }
    // #endregion

    // #region Message basics
    // Send a message using either string, embed object, or raw object
    send(channelId: string, content: MessageContent) {
        return this.client.messages.send(channelId, content instanceof Embed ? { embeds: [content.toJSON()] } : typeof content === "string" ? { content } : content);
    }

    // Reply to a message
    reply(message: Message, content: MessageBody) {
        const opts: MessageBody = typeof content === "string" ? { replyMessageIds: [message.id], content } : content;
        return this.client.messages.send(message.channelId, opts);
    }

    sendEmbed(channelId: string, embed: EmbedPayload, messagePartial?: Partial<MessageBody>) {
        return this.send(channelId, {
            ...messagePartial,
            embeds: [embed],
        });
    }

    replyWithEmbed(message: Message, embed: EmbedPayload, messagePartial?: Partial<MessageBody>) {
        return this.sendEmbed(message.channelId, embed, { replyMessageIds: [message.id], ...messagePartial });
    }
    // #endregion

    // #region Message content and state messages
    // /////////////////////////
    //    Content & Info    //
    // ////////////////////////

    replyWithInfo(message: Message, title: string, description: string, embedPartial?: EmbedPayload, messagePartial?: Partial<MessageBody>) {
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

    sendInfoBlock(channelId: string, title: string, description: string, embedPartial?: EmbedPayload, messagePartial?: Partial<MessageBody>) {
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

    replyWithList<T>(message: Message, title: string, items: T[] | undefined | null, tip?: string, embedPartial?: EmbedPayload, messagePartial?: Partial<MessageBody>) {
        return items?.length
            ? this.replyWithEmbed(
                  message,
                  {
                      title,
                      description: items.join("\n"),
                      color: Colors.blockBackground,
                      footer: {
                          text: `${items.length} total entries`,
                      },
                      ...embedPartial,
                  },
                  messagePartial
              )
            : this.replyWithNullState(message, `No items here`, `There is nothing here to show.${tip ? `\n\n${tip}` : ""}`, undefined, messagePartial);
    }

    replyWithCategorizedList(
        message: Message,
        title: string,
        items: Collection<string, string[]>,
        footer: string,
        embedPartial?: EmbedPayload,
        messagePartial?: Partial<MessageBody>
    ) {
        return this.replyWithEmbed(
            message,
            {
                title,
                color: Colors.blockBackground,
                fields: items.map((values, key) => ({
                    name: key,
                    value: listInlineCode(values)!,
                    inline: true,
                })),
                footer: {
                    text: footer,
                },
                ...embedPartial,
            },
            messagePartial
        );
    }

    replyWithPaginatedContent<T>(info: {
        replyTo: Message;
        title: string;
        items: T[];
        itemsPerPage: number;
        itemMapping: (item: T, index: number) => string | T;
        page?: number;
        embed?: EmbedPayload;
        message?: Partial<MessageBody>;
    }) {
        const { replyTo: message, title, items, itemsPerPage, itemMapping, page: pageOrNull, embed: embedPartial, message: messagePartial } = info;

        const page = pageOrNull ?? 0;

        // Math.ceil(21 / 10) => Math.ceil(2.1) => 3
        const possiblePages = Math.ceil(items.length / itemsPerPage);

        const incrementedPage = page + 1;

        // If there is no such page
        if (incrementedPage > possiblePages)
            return this.replyWithNullState(message, `No items here`, `There are no items at page ${inlineCode(incrementedPage)}.`, undefined, messagePartial);

        const startingIndex = itemsPerPage * page;
        const endingIndex = itemsPerPage * incrementedPage;

        return this.replyWithInfo(
            message,
            title,
            items.slice(startingIndex, endingIndex).map(itemMapping).join("\n"),
            {
                footer: {
                    text: `Page ${incrementedPage}/${possiblePages} \u2022 ${items.length} total entries`,
                },
                ...embedPartial,
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

    replyWithSuccess(message: Message, title: string, description: string, embedPartial?: EmbedPayload, messagePartial?: Partial<MessageBody>) {
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

    // Value blocks
    sendSuccessBlock(channelId: string, title: string, description: string, embedPartial?: EmbedPayload, messagePartial?: Partial<MessageBody>) {
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

    replyWithNullState(message: Message, title: string, description: string, embedPartial?: EmbedPayload, messagePartial?: Partial<MessageBody>) {
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

    // /////////////////////////
    //  Errors & Unexpected  //
    // /////////////////////////
    replyWithWarning(message: Message, title: string, description: string, embedPartial?: EmbedPayload, messagePartial?: Partial<MessageBody>) {
        return this.replyWithEmbed(
            message,
            {
                author: { name: title, icon_url: BotImages.exclamationmark },
                description,
                color: Colors.yellow,
                thumbnail: { url: StateImages.stop },
                ...embedPartial,
            },
            messagePartial
        );
    }

    sendWarningBlock(channelId: string, title: string, description: string, embedPartial?: EmbedPayload, messagePartial?: Partial<MessageBody>) {
        return this.sendEmbed(
            channelId,
            {
                author: { name: title, icon_url: BotImages.exclamationmark },
                description,
                color: Colors.yellow,
                thumbnail: { url: StateImages.stop },
                ...embedPartial,
            },
            messagePartial
        );
    }

    replyWithError(message: Message, title: string, description: string, embedPartial?: EmbedPayload, messagePartial?: Partial<MessageBody>) {
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

    sendErrorBlock(channelId: string, title: string, description: string, embedPartial?: EmbedPayload, messagePartial?: Partial<MessageBody>) {
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

    replyWithUnexpected(message: Message, description: string, embedPartial?: EmbedPayload, messagePartial?: Partial<MessageBody>) {
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

    replyWithUnpermitted(message: Message, description: string, embedPartial?: EmbedPayload, messagePartial?: Partial<MessageBody>) {
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
}
