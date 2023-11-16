import { RoleType } from "@prisma/client";
import rest, { clientRest } from "../../guilded";
import { GuildedClientChannel, GuildedSanitizedChannel } from "../../lib/@types/guilded";

export const allowedRoleTypes = [RoleType.ADMIN, RoleType.MOD, RoleType.MINIMOD];

export async function roleExistsInServer(serverId: string, roleId: number) {
    const { roles: serverRoles } = await rest.router.roles.roleReadMany({ serverId });

    return serverRoles.find((x) => x.id === roleId);
}

export const channelExistsInServer = async (channelId: string) =>
    rest.router.channels
        .channelRead({ channelId })
        .then(() => true)
        .catch(() => false);

const textChannelTypes = ["chat", "voice", "stream"];

export const getServerTextChannels = async (serverId: string) => {
    const { channels: unfilteredChannels } = (await clientRest.get(`/teams/${serverId}/channels`, { excludeBadgedContent: true })) as {
        channels: GuildedClientChannel[];
    };

    return unfilteredChannels
        .filter((x) => textChannelTypes.includes(x.contentType) && !x.archivedAt)
        .map(({ id, contentType, name, description, priority, groupId, isPublic, createdBy }) => ({
            id,
            contentType,
            name,
            description,
            priority,
            groupId,
            isPublic,
            createdBy,
        })) as GuildedSanitizedChannel[];
};