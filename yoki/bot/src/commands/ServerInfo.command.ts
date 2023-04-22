import { Colors, escapeInlineCodeText, inlineCode } from "@yokilabs/util";
import { stripIndents } from "common-tags";
import { Embed, EmbedField } from "guilded.js";

import type { Command } from "./commands";

const ServerInfo: Command = {
    name: "serverinfo",
    description: "View information about the server.",
    aliases: ["server", "si"],
    args: [],
    execute: async (message, _args, ctx, { server }) => {
        const guildedServer = await ctx.servers.fetch(message.serverId!);

        const memberCount = (await ctx.members.fetchMany(message.serverId!)).size;

        return ctx.messageUtil.send(message.channelId, {
            embeds: [
                new Embed()
                    .setTitle(`${guildedServer.isVerified ? ":white_check_mark: " : ""}${guildedServer.name} (${inlineCode(guildedServer.id)})`)
                    .setColor(Colors.blockBackground)
                    .setDescription(`Info about the current server.`)
                    .addFields([
                        {
                            name: "Basic Configuration",
                            value: stripIndents`
                                **Prefix:** ${inlineCode(escapeInlineCodeText(server.getPrefix()))},
                                **Locale:** ${inlineCode(server.locale)}
                                **Premium level:** ${server.premium ? inlineCode(server.premium) : "none"}
                            `,
                            inline: true
                        },
                        {
                            name: "Members",
                            value: stripIndents`
                                **Owner:** :crown: <@${guildedServer.ownerId}> (${inlineCode(guildedServer.ownerId)})
                                **Member count:** ${inlineCode(memberCount)}
                            `,
                            inline: true
                        },
                        guildedServer.description && {
                            name: "Description",
                            value: guildedServer.description
                        },
                        {
                            name: "Additional Info",
                            value: stripIndents`
                                ${guildedServer.isVerified ? ":white_check_mark: **Is verified.**\n" : ""}**URL:** \`/${guildedServer.shortURL}\`
                                **Timezone:** ${inlineCode(guildedServer.timezone)}
                                **Server created:** ${server.formatTimezone(guildedServer.createdAt)} EST
                            `
                        },
                    ].filter(Boolean) as EmbedField[])
                    .setThumbnail(guildedServer.iconURL ?? void 0)
                    .toJSON(),
            ],
            isSilent: true,
        });
    },
};

export default ServerInfo;
