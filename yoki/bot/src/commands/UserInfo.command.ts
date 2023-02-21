import type { TeamMemberPayload } from "@guildedjs/guilded-api-typings";
import { stripIndents } from "common-tags";
import { Embed } from "guilded.js";

import { Colors } from "../utils/color";
import { inlineCode } from "../utils/formatters";
import { summarizeRolesOrUsers } from "../utils/messages";
import { suspicious as sus } from "../utils/util";
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
    execute: async (message, args, ctx, commandCtx) => {
        const target = (args.target as TeamMemberPayload) ?? (await ctx.rest.router.getMember(message.serverId!, message.createdBy)).member;

        const creationDate = new Date(target.user.createdAt);
        const suspicious = sus(creationDate);

        return ctx.messageUtil.send(message.channelId, {
            embeds: [
                new Embed()
                    .setTitle(`${target.isOwner ? ":crown: " : ""}<@${target.user.id}> (${inlineCode(target.user.id)})`)
                    .setColor(Colors.blockBackground)
                    .setDescription(
                        `Info about user ${inlineCode(target.user.name)}. ${
                            target.nickname ? `Their nickname is ${inlineCode(target.nickname)}.` : `They do not have a nickname.`
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
                                **Joined at:** ${commandCtx.server.formatTimezone(new Date(target.joinedAt))} EST
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
