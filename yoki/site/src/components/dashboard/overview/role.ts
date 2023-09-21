import { RolePayload } from "@guildedjs/api";

export const optionifyRoles = (serverRoles: RolePayload[]) =>
    serverRoles
        .sort((a, b) => b.position - a.position)
        .map((serverRole) => ({
            name: serverRole.name,
            value: serverRole.id,
            avatarIcon: serverRole.icon,
            color: serverRole.colors?.[0],
        }));
