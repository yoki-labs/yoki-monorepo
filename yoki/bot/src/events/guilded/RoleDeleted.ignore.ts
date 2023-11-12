import { RolePayload } from "guilded.js";

import { LogChannelType, type Context, type Server } from "../../typings";
import { inlineCode, inlineQuote } from "@yokilabs/bot";
import { stripIndents } from "common-tags";
import { Colors } from "@yokilabs/utils";

export default async (packet: { d: { serverId: string; role: RolePayload } }, ctx: Context, { muteRoleId, memberRoleId }: Server) => {
    const { serverId, role } = packet.d;

    // Remove the role as a mute or member role
    if (role.id === muteRoleId || role.id === memberRoleId)
        await ctx.prisma.server.update({
            where: {
                serverId,
            },
            data: {
                muteRoleId: muteRoleId === role.id ? null : undefined,
                memberRoleId: memberRoleId === role.id ? null : undefined,
            },
        });

    // Delete logs that have the deleted channel; there is no way for them to log anymore
    // If there is nothing, the count is returned as 0; there is no error
    await ctx.prisma.role.deleteMany({
        where: {
            serverId,
            roleId: role.id,
        },
    });

    // check if there's a log channel channel for message deletions
    const roleDeletedLogChannel = await ctx.dbUtil.getLogChannel(serverId, LogChannelType.role_deletions);
    if (!roleDeletedLogChannel) return;

    // send the log channel message with the content/data of the deleted message
    return ctx.messageUtil.sendLog({
        where: roleDeletedLogChannel.channelId,
        author: {
            name: `Role deleted \u2022 ${role.name}`,
            icon_url: role.icon,
        },
        serverId,
        description: `A role ${inlineQuote(role.name)} was deleted from the server.`,
        additionalInfo: stripIndents`
            **Position:** ${inlineCode(role.position)}
            **Role ID:** ${inlineCode(role.id)}
        `,
        color: Colors.red,
    });
    // TODO: Delete role states? Might just be able to ignore deleted roles when regiving roles
    // That way, less changes to the database happen
};
