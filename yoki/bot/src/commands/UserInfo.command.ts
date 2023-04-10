import { stripIndents } from "common-tags";
import { Embed, Member } from "guilded.js";

import { Colors } from "@yokilabs/util";
import { inlineCode } from "@yokilabs/util";
import { summarizeRolesOrUsers } from "@yokilabs/util";
import { suspicious as sus } from "../utils/util";
import type { Command } from "./commands";

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
    execute: async (message, args, ctx, commandCtx) => {
        const target = (args.target as Member) ?? await message.client.members.fetch(message.serverId!, message.authorId);

        const creationDate = target.user!.createdAt!;
        const suspicious = sus(creationDate);

        return ctx.messageUtil.send(message.channelId, {
            embeds: [
                new Embed()
                    .setTitle(`${target.isOwner ? ":crown: " : ""}<@${target.user!.id}> (${inlineCode(target.user!.id)})`)
                    .setColor(Colors.blockBackground)
                    .setDescription(
                        `Info about user ${inlineCode(target.user!.name)}. ${target.nickname ? `Their nickname is ${inlineCode(target.nickname)}.` : `They do not have a nickname.`
                        }`
                    )
                    .addFields([
                        {
                            name: "Roles",
                            value: summarizeRolesOrUsers(target.roleIds),
                        },
                        {
                            name: "Additional Info",
                            value: stripIndents`
                                ${target.isOwner ? `**Owns this server.**\n` : ``}**Account Created:** ${commandCtx.server.formatTimezone(creationDate)} EST ${suspicious ? "(:warning: recent)" : ""}
                                **Joined at:** ${commandCtx.server.formatTimezone(new Date(target.joinedAt!))} EST
                            `,
                        },
                    ])
                    .setThumbnail(target.user!.avatar!)
                    .toJSON(),
            ],
            isSilent: true,
        });
    },
};

export default UserInfo;
