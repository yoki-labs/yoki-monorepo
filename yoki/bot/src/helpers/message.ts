import type { EmbedField } from "@guildedjs/guilded-api-typings";
import { stripIndents } from "common-tags";

import type { Command } from "../commands/commands";
import { Colors } from "@yokilabs/util";
import { MessageUtil as BaseMessageUtil } from "@yokilabs/bot";
import type YokiClient from "../Client";
import type { Server } from "../typings";

export class MessageUtil extends BaseMessageUtil<YokiClient, Server, Command> {
    readonly logchannelErrCounter: Record<string, number> = {};

    // 	createSubCommandFields(subCommands: Collection<string, Command>): EmbedField[] {
    // 		const allSubCommands = subCommands.map((x) => `${inlineCode(x.subName!)}\n${x.description}`);

    // 		const [half, otherHalf] = cutArray(allSubCommands);

    // 		return [
    // 			{
    // 				name: "Sub-commands",
    // 				value: half.join("\n\n"),
    // 				inline: true,
    // 			},
    // 			{
    // 				name: "",
    // 				value: otherHalf.join("\n\n"),
    // 				inline: true,
    // 			},
    // 		];
    // 	}

    // 	createUsageField(command: Command, prefix: string, commandPath?: string): EmbedField {
    // 		return {
    // 			name: "Usage",
    // 			value: stripIndents`
    //                         \`\`\`clojure
    //                         ${prefix}${commandPath ?? command.name.split("-").join(" ")} ${command.usage}
    //                         \`\`\`
    //                     `,
    // 		};
    // 	}

    // 	createExampleField(command: Command, prefix: string, commandPath?: string): EmbedField {
    // 		return {
    // 			name: "Example",
    // 			value: stripIndents`
    //                         \`\`\`md
    //                         ${prefix}${commandPath ?? command.name.split("-").join(" ")} ${command.examples ? command.examples[0] : ""}
    //                         \`\`\`
    //                     `,
    // 		};
    // 	}

    // 	transformEmbed(embed: Embed | EmbedPayload, embedPartial?: Embed | EmbedPayload): EmbedPayload {
    // 		const ret: EmbedPayload = {};
    // 		if (embed instanceof Embed) {
    // 			Object.assign(ret, embed.toJSON());
    // 		} else {
    // 			Object.assign(ret, embed);
    // 		}

    // 		if (embedPartial instanceof Embed) {
    // 			Object.assign(ret, embedPartial.toJSON);
    // 		} else if (embed) {
    // 			Object.assign(ret, embedPartial);
    // 		}

    // 		return ret;
    // 	}

    // 	// Send a message using either string, embed object, or raw object
    // 	send(channelId: string, content: string | RESTPostChannelMessagesBody | Embed) {
    // 		return this.client.messages.send(channelId, content instanceof Embed ? { embeds: [content.toJSON()] } : typeof content === "string" ? { content } : content)
    // 	}

    // 	// Reply to a message
    // 	reply(message: Message, content: string | RESTPostChannelMessagesBody) {
    // 		const opts: RESTPostChannelMessagesBody | string = typeof content === "string" ? { replyMessageIds: [message.id], content } : content;
    // 		return this.client.messages.send(message.channelId, opts);
    // 	}

    // 	handleBadArg(message: Message, prefix: string, commandArg: CommandArgument, command: Command) {
    // 		return this.replyWithError(
    // 			message,
    // 			`Incorrect argument`,
    // 			`Sorry, but the usage of argument ${inlineCode(commandArg.name.split("-").join(" "))} was not correct. Was expecting a ${commandArg.type === "enum" || commandArg.type === "enumList" ? listInlineCode(Object.keys(commandArg.values).map((x) => x.toLowerCase())) : commandArg.type
    // 			}${commandArg.max ? ` with the limit of ${commandArg.max}` : ""}.`,
    // 			{
    // 				fields: [this.createUsageField(command, prefix)],
    // 			}
    // 		);
    // 	}

    // 	sendEmbed(channelId: string, embed: Embed | EmbedPayload, messagePartial?: Partial<RESTPostChannelMessagesBody>) {
    // 		return this.send(channelId, {
    // 			...messagePartial,
    // 			embeds: [(embed instanceof Embed ? embed.toJSON() : embed)],
    // 		});
    // 	}

    sendLog({
        where,
        serverId,
        title,
        description,
        color,
        occurred,
        additionalInfo,
        fields,
    }: {
        where: string;
        serverId: string;
        title: string;
        description: string;
        color: number;
        occurred: string;
        additionalInfo?: string;
        fields?: EmbedField[];
    }) {
        return this.client.messages.send(where, {
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
        }).catch(async (e) => {
            const existing = this.logchannelErrCounter[where] ?? 0;

            if (existing > 3) {
                const server = await this.client.servers.fetch(serverId).catch(() => null);
                if (!server) return;

                const { defaultChannelId } = server;
                if (defaultChannelId) await this.client.messageUtil.send(defaultChannelId, {
                    embeds: [{
                        color: Colors.red, description: stripIndents`
						<@${server.ownerId}>, the log channel with the ID \`${where}\` has blocked the bot from sending a log message three consistent times. 
						As such, we've gone ahead and deleted it from your settings. 
						Please readjust the channel permissions and add the channel back once done.
						
						[Need help? Join our support server](https://guilded.gg/Yoki)`
                    }]
                });
                await this.client.prisma.logChannel.deleteMany({ where: { channelId: where, serverId } });
                await this.client.errorHandler.send(stripIndents`
					Deleted log channel for count
					Channel: \`${where}\`
					Count: \`${existing}\`
				`)
                delete this.logchannelErrCounter[where];
            } else {
                await this.client.errorHandler.send(stripIndents`
					Log channel err. ${e.message}
					Channel: \`${where}\`
					Count: \`${existing}\`
				`)
                this.logchannelErrCounter[where] = existing + 1;
            }
            return null;
        });
    }

    // 	replyWithEmbed(message: Message, embed: EmbedPayload, messagePartial?: Partial<RESTPostChannelMessagesBody>) {
    // 		return this.sendEmbed(message.channelId, embed, { replyMessageIds: [message.id], ...messagePartial });
    // 	}

    // 	// State blocks
    // 	replyWithError(message: Message, title: string, description: string, embedPartial?: Embed | EmbedPayload, messagePartial?: Partial<RESTPostChannelMessagesBody>) {
    // 		return this.replyWithEmbed(
    // 			message,
    // 			this.transformEmbed({
    // 				author: { name: title, icon_url: BotImages.crossmark },
    // 				description,
    // 				color: Colors.red,
    // 				thumbnail: { url: StateImages.notFound },
    // 			}, embedPartial),
    // 			messagePartial
    // 		);
    // 	}

    // 	replyWithUnexpected(message: Message, description: string, embedPartial?: Embed | EmbedPayload, messagePartial?: Partial<RESTPostChannelMessagesBody>) {
    // 		return this.replyWithEmbed(
    // 			message,
    // 			this.transformEmbed({
    // 				author: { name: `Oh no, something went wrong!`, icon_url: BotImages.crossmark },
    // 				description,
    // 				color: Colors.red,
    // 				thumbnail: { url: StateImages.error },
    // 			}, embedPartial),
    // 			messagePartial
    // 		);
    // 	}

    // 	replyWithUnpermitted(message: Message, description: string, embedPartial?: Embed | EmbedPayload, messagePartial?: Partial<RESTPostChannelMessagesBody>) {
    // 		return this.replyWithEmbed(
    // 			message,
    // 			this.transformEmbed({
    // 				author: { name: `Can't do that!`, icon_url: BotImages.crossmark },
    // 				description,
    // 				color: Colors.red,
    // 				thumbnail: { url: StateImages.stop },
    // 			}, embedPartial),
    // 			messagePartial
    // 		);
    // 	}

    // 	replyWithNullState(message: Message, title: string, description: string, embedPartial?: Embed | EmbedPayload, messagePartial?: Partial<RESTPostChannelMessagesBody>) {
    // 		return this.replyWithEmbed(
    // 			message,
    // 			this.transformEmbed({
    // 				title: `:grey_question: ${title}`,
    // 				description,
    // 				color: Colors.blockBackground,
    // 				thumbnail: { url: StateImages.nothingHere },
    // 			}, embedPartial),
    // 			messagePartial
    // 		);
    // 	}

    // 	replyWithInfo(message: Message, title: string, description: string, embedPartial?: Embed | EmbedPayload, messagePartial?: Partial<RESTPostChannelMessagesBody>) {
    // 		return this.replyWithEmbed(
    // 			message,
    // 			this.transformEmbed({
    // 				title,
    // 				description,
    // 				color: Colors.blockBackground,
    // 			}, embedPartial),
    // 			messagePartial
    // 		);
    // 	}

    // 	replyWithBotInfo(message: Message, title: string, description: string, embedPartial?: Embed | EmbedPayload, messagePartial?: Partial<RESTPostChannelMessagesBody>) {
    // 		return this.send(message.channelId, {
    // 			embeds: [
    // 				this.transformEmbed({
    // 					author: {
    // 						name: `${this.client.user?.name}'s ${title}`,
    // 						icon_url: this.client.user?.avatar ?? undefined,
    // 					},
    // 					description,
    // 					color: Colors.blockBackground,
    // 				}, embedPartial),
    // 			],
    // 			replyMessageIds: [message.id],
    // 			...messagePartial,
    // 		});
    // 	}

    // 	sendWarningBlock(channelId: string, title: string, description: string, embedPartial?: Embed | EmbedPayload, messagePartial?: Partial<RESTPostChannelMessagesBody>) {
    // 		return this.sendEmbed(
    // 			channelId,
    // 			this.transformEmbed({
    // 				title,
    // 				description,
    // 				color: Colors.yellow,
    // 				thumbnail: { url: StateImages.stop },
    // 			}, embedPartial),
    // 			messagePartial
    // 		);
    // 	}

    // 	sendErrorBlock(channelId: string, title: string, description: string, embedPartial?: Embed | EmbedPayload, messagePartial?: Partial<RESTPostChannelMessagesBody>) {
    // 		return this.sendEmbed(
    // 			channelId,
    // 			this.transformEmbed({
    // 				author: { name: title, icon_url: BotImages.crossmark },
    // 				description,
    // 				color: Colors.red,
    // 				thumbnail: { url: StateImages.notFound },
    // 			}, embedPartial),
    // 			messagePartial
    // 		);
    // 	}

    // 	sendInfoBlock(channelId: string, title: string, description: string, embedPartial?: Embed | EmbedPayload, messagePartial?: Partial<RESTPostChannelMessagesBody>) {
    // 		return this.sendEmbed(
    // 			channelId,
    // 			this.transformEmbed({
    // 				title,
    // 				description,
    // 				color: Colors.blockBackground,
    // 			}, embedPartial),
    // 			messagePartial
    // 		);
    // 	}

    // 	// Value blocks
    // 	sendSuccessBlock(channelId: string, title: string, description: string, embedPartial?: Embed | EmbedPayload, messagePartial?: Partial<RESTPostChannelMessagesBody>) {
    // 		return this.sendEmbed(
    // 			channelId,
    // 			this.transformEmbed({
    // 				author: { name: title, icon_url: BotImages.checkmark },
    // 				description,
    // 				color: Colors.green,
    // 			}, embedPartial),
    // 			messagePartial
    // 		);
    // 	}

    // 	replyWithSuccess(message: Message, title: string, description: string, embedPartial?: Embed | EmbedPayload, messagePartial?: Partial<RESTPostChannelMessagesBody>) {
    // 		return this.replyWithEmbed(
    // 			message,
    // 			this.transformEmbed({
    // 				author: { name: title, icon_url: BotImages.checkmark },
    // 				description,
    // 				color: Colors.green,
    // 			}, embedPartial),
    // 			messagePartial
    // 		);
    // 	}

    // 	// Special blocks
    // 	replyWithPaginatedContent<T>(info: {
    // 		replyTo: Message;
    // 		title: string;
    // 		items: T[];
    // 		itemsPerPage: number;
    // 		itemMapping: (item: T) => string | T;
    // 		page?: number;
    // 		embed?: Embed | EmbedPayload;
    // 		message?: Partial<RESTPostChannelMessagesBody>;
    // 	}) {
    // 		const { "replyTo": message, title, items, itemsPerPage, itemMapping, "page": pageOrNull, "embed": embedPartial, "message": messagePartial } = info;

    // 		const page = pageOrNull ?? 0;

    // 		// Math.ceil(21 / 10) => Math.ceil(2.1) => 3
    // 		const possiblePages = Math.ceil(items.length / itemsPerPage);

    // 		const incrementedPage = page + 1;

    // 		// If there is no such page
    // 		if (incrementedPage > possiblePages)
    // 			return this.replyWithNullState(message, `No items in this page`, `There are no items at page ${inlineCode(incrementedPage)}.`, undefined, messagePartial);

    // 		const startingIndex = itemsPerPage * page;
    // 		const endingIndex = itemsPerPage * incrementedPage;

    // 		return this.replyWithInfo(
    // 			message,
    // 			title,
    // 			items.slice(startingIndex, endingIndex).map(itemMapping).join("\n"),
    // 			this.transformEmbed({
    // 				footer: {
    // 					text: `Page ${incrementedPage}/${possiblePages} • ${items.length} total items`,
    // 				},
    // 			}, embedPartial),
    // 			messagePartial
    // 		);
    // 	}

    // 	replyWithEnableStateList(message: Message, title: string, enabledItems: string[], allItems: string[], descriptions: Record<string, string>) {
    // 		const itemDisplays = allItems.map((item) => {
    // 			const formattedItem = `\`${item}\``;
    // 			const itemWithState = enabledItems.includes(item) ? `:white_check_mark: **${formattedItem}**` : formattedItem;
    // 			return `${itemWithState}\n${descriptions[item]}`;
    // 		});

    // 		const [half, otherHalf] = cutArray(itemDisplays);

    // 		return this.replyWithEmbed(message, {
    // 			color: Colors.blockBackground,
    // 			fields: [
    // 				{
    // 					name: title,
    // 					value: half.join("\n\n"),
    // 					inline: true,
    // 				},
    // 				{
    // 					name: "",
    // 					value: otherHalf.join("\n\n"),
    // 					inline: true,
    // 				},
    // 			],
    // 		});
    // 	}
}