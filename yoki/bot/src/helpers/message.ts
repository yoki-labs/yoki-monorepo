import type { EmbedField } from "@guildedjs/guilded-api-typings";
import { MessageUtil as BaseMessageUtil } from "@yokilabs/bot";
import { Colors } from "@yokilabs/utils";
import { stripIndents } from "common-tags";
import { EmbedAuthor, EmbedFooter } from "guilded.js";

import type YokiClient from "../Client";
import type { Command } from "../commands/commands";
import type { Server } from "../typings";

export class MessageUtil extends BaseMessageUtil<YokiClient, Server, Command> {
    readonly logchannelErrCounter: Record<string, number> = {};

    sendLog({
        where,
        serverId,
        title,
        description,
        color,
        additionalInfo,
        fields,
        author,
        footer,
    }: {
        where: string;
        serverId: string;
        title?: string;
        description: string;
        color: number;
        occurred?: string;
        additionalInfo?: string;
        fields?: Array<EmbedField>;
        author?: EmbedAuthor | null;
        footer?: EmbedFooter | null;
    }) {
        return this.client.messages
            .send(where, {
                embeds: [
                    {
                        author: {
                            iconURL: author?.icon_url ?? null,
                            name: author?.name ?? null,
                            // url: author?.url ?? null,
                        },
                        footer: {
                            iconURL: footer?.icon_url ?? null,
                            text: footer?.text ?? null,
                        },
                        title: title ?? null,
                        description,
                        color,
                        fields: additionalInfo ? (fields ?? []).concat({ name: "Additional Info", value: additionalInfo, inline: false }) : fields ?? [],
                        // timestamp: Number.isInteger(occurred) ? Number(occurred) : null,
                    },
                ],
                isSilent: true,
            })
            .catch(async (e) => {
                const existing = this.logchannelErrCounter[where] ?? 0;

                if (existing > 3) {
                    const server = await this.client.servers.fetch(serverId).catch(() => null);
                    if (!server) return;

                    const { defaultChannelId } = server;
                    await this.client.prisma.logChannel.deleteMany({ where: { channelId: where, serverId } });
                    await this.client.errorHandler.send(stripIndents`
                        Deleted log channel for count
                        Channel: \`${where}\`
                        Count: \`${existing}\`
                    `);

                    if (defaultChannelId)
                        await this.client.messageUtil
                            .send(defaultChannelId, {
                                embeds: [
                                    {
                                        color: Colors.red,
                                        description: stripIndents`
						<@${server.ownerId}>, the log channel with the ID \`${where}\` has blocked the bot from sending a log message three consistent times. 
						As such, we've gone ahead and deleted it from your settings. 
						Please readjust the channel permissions and add the channel back once done.
						
						[Need help? Join our support server](https://guilded.gg/Yoki)`,
                                    },
                                ],
                            })
                            .catch(() => null);
                    delete this.logchannelErrCounter[where];
                } else {
                    await this.client.errorHandler.send(stripIndents`
					Log channel err. ${e.message}
					Channel: \`${where}\`
					Count: \`${existing}\`
				`);
                    this.logchannelErrCounter[where] = existing + 1;
                }
                return null;
            });
    }
}
