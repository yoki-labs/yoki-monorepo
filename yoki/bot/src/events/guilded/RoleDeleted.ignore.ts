import { RolePayload } from "guilded.js";
import type { Context, Server } from "../../typings";

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
            }
        });

    // Delete logs that have the deleted channel; there is no way for them to log anymore
    // If there is nothing, the count is returned as 0; there is no error
    return ctx.prisma.role.deleteMany({
        where: {
            serverId,
            roleId: role.id,
        },
    });

    // TODO: Delete role states? Might just be able to ignore deleted roles when regiving roles
    // That way, less changes to the database happen
};
