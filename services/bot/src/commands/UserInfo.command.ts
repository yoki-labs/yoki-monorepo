import { Embed } from "@guildedjs/embeds";
import type { TeamMemberPayload } from "@guildedjs/guilded-api-typings";
import { stripIndents } from "common-tags";

import { Colors } from "../utils/color";
import { inlineCode } from "../utils/formatters";
import { FormatDate, suspicious as sus } from "../utils/util";
import type { Command } from "./Command";

const UserInfo: Command = {
    name: "userinfo",
    description: "View information about a user or yourself.",
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

        const creationDate = new Date(target.user.createdAt);
        const suspicious = sus(creationDate);

        return ctx.messageUtil.send(message.channelId, {
            embeds: [
                new Embed()
                    .setTitle(`${target.isOwner ? ":crown: " : ""}<@${target.user.id}> (${inlineCode(target.user.id)})`)
                    .setColor(Colors.blockBackground)
                    .setDescription(
                        `The information about the user by the name of ${inlineCode(target.user.name)}. ${
                            target.nickname ? `Their nickname is ${inlineCode(target.nickname)}.` : `They do not have a nickname.`
                        }`
                    )
                    .addFields([
                        {
                            name: "Roles",
                            value: `${target.roleIds
                                .slice(0, 20)
                                .map((x) => `<@${x}>`)
                                .join(", ")}${target.roleIds.length > 20 ? ` and ${target.roleIds.length - 20} more` : ""}`,
                        },
                        {
                            name: "Additional Info",
                            value: stripIndents`
                                ${target.isOwner ? `**Owns this server.**\n` : ``}**Account Created:** ${FormatDate(creationDate)} ${suspicious ? "(:warning: recent)" : ""}
                                **Joined at:** ${FormatDate(new Date(target.joinedAt))}
                            `,
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
