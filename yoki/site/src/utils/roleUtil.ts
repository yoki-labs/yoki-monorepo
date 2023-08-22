import { RoleType } from "@prisma/client";
import rest from "../guilded";

export const allowedRoleTypes = [RoleType.ADMIN, RoleType.MOD, RoleType.MINIMOD];

export async function roleExistsInServer(serverId: string, roleId: number) {
    const { roles: serverRoles } = await rest.router.roles.roleReadMany({ serverId });

    return serverRoles.find((x) => x.id === roleId);
}