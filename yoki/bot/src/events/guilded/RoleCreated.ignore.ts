import { RolePayload } from "guilded.js";

import { LogChannelType, type Context, type Server } from "../../typings";
import { inlineCode, inlineQuote } from "@yokilabs/bot";
import { stripIndents } from "common-tags";
import { Colors } from "@yokilabs/utils";

export default async (packet: { d: { serverId: string; role: RolePayload } }, ctx: Context, _: Server) => {
    const { serverId, role } = packet.d;

    // check if there's a log channel channel for message deletions
    const roleCreatedLogChannel = await ctx.dbUtil.getLogChannel(serverId, LogChannelType.role_creations);
    if (!roleCreatedLogChannel) return;

    // send the log channel message with the content/data of the deleted message
    return ctx.messageUtil.sendLog({
        where: roleCreatedLogChannel.channelId,
        author: {
            name: `Role created \u2022 ${role.name}`,
            icon_url: role.icon,
        },
        serverId,
        description: `A new role by the name of ${inlineQuote(role.name)} was created in the server.`,
        additionalInfo: stripIndents`
            **Position:** ${inlineCode(role.position)}
            **Role ID:** ${inlineCode(role.id)}
        `,
        color: Colors.green,
    });
    // TODO: Delete role states? Might just be able to ignore deleted roles when regiving roles
    // That way, less changes to the database happen
};
