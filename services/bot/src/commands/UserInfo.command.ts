import { Embed } from "@guildedjs/embeds";
import type { TeamMemberPayload } from "@guildedjs/guilded-api-typings";

import { Colors } from "../utils/color";
import { FormatDate } from "../utils/util";
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
                            value: `${FormatDate(new Date(target.user.createdAt))} EST`,
                            inline: false,
                        },
                        {
                            name: "Joined Server",
                            value: `${FormatDate(new Date(target.joinedAt))} EST`,
                            inline: true,
                        },
                        {
                            name: "Roles",
                            value: `${target.roleIds
                                .map((x) => `<@${x}>`)
                                .join(" ")
                                .slice(0, 500)}`,
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
