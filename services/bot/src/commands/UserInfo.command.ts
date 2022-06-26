import { Embed } from "@guildedjs/embeds";
import type { TeamMemberPayload } from "@guildedjs/guilded-api-typings";

import { Colors } from "../color";
import type { Command } from "./Command";

const UserInfo: Command = {
    name: "userinfo",
    description: "Get information about a user or yourself",
    usage: "[id-of-user]",
    examples: ["0mqNyllA"],
    aliases: ["user"],
    args: [
        {
            name: "target",
            type: "member",
            optional: true,
        },
    ],
    execute: async (message, args, ctx) => {
        const target = (args.target as TeamMemberPayload) ?? (await ctx.rest.router.getMember(message.serverId!, message.createdBy)).member;

        return ctx.messageUtil.send(message.channelId, {
            embeds: [
                new Embed()
                    .setTitle(`${target.user.name}'s info`)
                    .setColor(Colors.blockBackground)
                    .addFields([
                        {
                            name: "ID",
                            value: target.user.id,
                            inline: true,
                        },
                        {
                            name: "Username (nickname)",
                            value: `${target.user.name}${target.nickname ? ` (${target.nickname})` : ""}`,
                            inline: true,
                        },
                        {
                            name: "Owns this server",
                            value: String(target.isOwner ?? false),
                            inline: true,
                        },
                        {
                            name: "Account Age",
                            value: `${new Date(target.user.createdAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            })} EST`,
                            inline: false,
                        },
                        {
                            name: "Joined Server",
                            value: `${new Date(target.joinedAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            })} EST`,
                            inline: true,
                        },
                        {
                            name: "Roles",
                            value: `${target.roleIds.map((x) => `<@${x}>`).join(" ")}`,
                            inline: true,
                        },
                    ])
                    .setThumbnail(target.user.avatar)
                    .toJSON(),
            ],
            isSilent: true,
        });
    },
};

export default UserInfo;
