import { Action, Role } from "@prisma/client";
import prisma from "../../../../../prisma";
import createServerRoute from "../../../../../utils/route";
import rest from "../../../../../guilded";
import { allowedRoleTypes, roleExistsInServer } from "../../../../../utils/roleUtil";

const serverRolesRoute = createServerRoute({
    async GET(_req, res, _session, { serverId }, _member) {
        const roles: Role[] = await prisma.role
            .findMany({
                where: {
                    serverId: serverId,
                }
            });

        const { roles: serverRoles } = await rest.router.roles.roleReadMany({ serverId });

        return res.status(200).json({
            roles: roles.map(({ id, ...rest }) => rest),
            serverRoles,
        });
    },
    async POST(req, res, _session, { serverId }, _member) {
        // Type-check body
        const { roleId, type } = req.body;

        if ((typeof roleId !== "number" || roleId < 1))
            return res.status(400).json({ error: true, message: "Expected roleId to be a positive number." });
        else if (!allowedRoleTypes.includes(type))
            return res.status(400).json({ error: true, message: "Expected type to be ADMIN, MOD or MINIMOD." });

        const roles: Role[] = await prisma.role
            .findMany({
                where: {
                    serverId: serverId,
                },
            });
        const existingRole = roles.find((x) => x.roleId === roleId);

        // Can't edit non-existant role
        if (existingRole)
            return res.status(404).json({ error: true, message: "Role by this ID is already a staff role." });

        // To determine whether we can use that role
        // Role doesn't exist in the server
        const serverRole = await roleExistsInServer(serverId, roleId);
        if (!serverRole)
            return res.status(400).json({ error: true, message: "Role by that ID does not exist in the server." });

        const createdRole = await prisma.role.create({
            data: {
                serverId,
                roleId: serverRole.id,
                type,
            },
        });

        return res.status(200).json({
            role: {
                serverId,
                roleId,
                type,
                createdAt: createdRole.createdAt,
            }
        });
    },
});

export default serverRolesRoute;