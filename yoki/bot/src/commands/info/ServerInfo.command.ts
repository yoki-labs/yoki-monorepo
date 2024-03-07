import { escapeInlineCodeText, inlineCode } from "@yokilabs/bot";
import { Colors } from "@yokilabs/utils";
import { stripIndents } from "common-tags";
import { Embed, EmbedField, ServerPayload } from "guilded.js";

import { Category, Command } from "../commands";

const ServerInfo: Command = {
    name: "serverinfo",
    description: "View information about this server.",
    category: Category.Info,
    aliases: ["server", "si"],
    args: [],
    execute: async (message, _args, ctx, { server }) => {
        const { server: guildedServer, serverMemberCount: memberCount } = (await ctx.rest.router.servers.serverRead({ serverId: message.serverId! })) as unknown as {
            server: ServerPayload;
            serverMemberCount: number;
        };

        return ctx.messageUtil.send(message.channelId, {
            embeds: [
                new Embed()
                    .setTitle(`${guildedServer.isVerified ? ":white_check_mark: " : ""}${guildedServer.name} (${inlineCode(guildedServer.id)})`)
                    .setColor(Colors.blockBackground)
                    .setDescription(`Info about the current server.`)
                    .addFields(
                        [
                            {
                                name: "Basic Configuration",
                                value: stripIndents`
                                    **Prefix:** ${inlineCode(escapeInlineCodeText(server.getPrefix()))},
                                    **Locale:** ${inlineCode(server.locale)}
                                    **Premium level:** ${server.premium ? inlineCode(server.premium) : "none"}
                                `,
                                inline: true,
                            },
                            {
                                name: "Members",
                                value: stripIndents`
                                    **Owner:** :crown: <@${guildedServer.ownerId}> (${inlineCode(guildedServer.ownerId)})
                                    **Member count:** ${inlineCode(memberCount)}
                                `,
                                inline: true,
                            },
                            guildedServer.about && {
                                name: "Description",
                                value: guildedServer.about,
                            },
                            {
                                name: "Additional Info",
                                value: stripIndents`
                                    ${guildedServer.isVerified ? ":white_check_mark: **Is verified.**\n" : ""}**URL:** \`/${guildedServer.url}\`
                                    **Timezone:** ${inlineCode(guildedServer.timezone)}
                                    **Server created:** ${server.formatTimezone(new Date(guildedServer.createdAt))} EST
                                `,
                            },
                        ].filter(Boolean) as EmbedField[]
                    )
                    .setThumbnail(guildedServer.avatar ?? void 0)
                    .toJSON(),
            ],
            isSilent: true,
        });
    },
};

export default ServerInfo;
