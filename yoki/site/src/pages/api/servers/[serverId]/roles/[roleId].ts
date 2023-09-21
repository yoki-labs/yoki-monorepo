import { Role } from "@prisma/client";

import prisma from "../../../../../prisma";
import createServerRoute, { allowedRoleTypes, roleExistsInServer } from "../../../../../utils/route";

const serverRolesRoute = createServerRoute({
    async PATCH(req, res, _session, { serverId }, _member) {
        const { roleId: roleIdQuery } = req.query;

        // Check query
        if (typeof roleIdQuery !== "string") return res.status(400).json({ error: true, message: "Role ID must exist" });

        const roleId = parseInt(roleIdQuery, 10);

        if (typeof roleId !== "number" || roleId < 0) return res.status(400).json({ error: true, message: "Expected role ID to be a positive number." });

        // Type-check body
        const { newRoleId, newType } = req.body;

        if (newRoleId !== null && (typeof newRoleId !== "number" || newRoleId < 1))
            return res.status(400).json({ error: true, message: "Expected newRoleId to be a positive number." });
        else if (newType !== null && !allowedRoleTypes.includes(newType)) return res.status(400).json({ error: true, message: "Expected newType to be ADMIN, MOD or MINIMOD." });

        const roles: Role[] = await prisma.role.findMany({
            where: {
                serverId,
            },
        });
        const existingRole = roles.find((x) => x.roleId === roleId);

        // Can't edit non-existant role
        if (!existingRole) return res.status(404).json({ error: true, message: "Role by this ID is not a staff role in Yoki." });

        // To determine whether we can use that role
        // Role doesn't exist in the server
        if (newRoleId && !(await roleExistsInServer(serverId, newRoleId))) return res.status(400).json({ error: true, message: "Role by that ID does not exist in the server." });

        await prisma.role.update({
            where: {
                id: existingRole.id,
            },
            data: {
                roleId: newRoleId ?? undefined,
                type: newType ?? undefined,
            },
        });

        return res.status(200).json({
            role: {
                ...existingRole,
                roleId: newRoleId ?? existingRole.roleId,
                type: newType ?? existingRole.type,
            },
        });
    },
    async DELETE(req, res, _session, { serverId }, _member) {
        const { roleId: roleIdQuery } = req.query;

        // Check query
        if (typeof roleIdQuery !== "string") return res.status(400).json({ error: true, message: "Role ID must exist" });

        const roleId = parseInt(roleIdQuery, 10);

        if (typeof roleId !== "number" || roleId < 0) return res.status(400).json({ error: true, message: "Expected role ID to be a positive number." });

        const roles: Role[] = await prisma.role.findMany({
            where: {
                serverId,
            },
        });
        const existingRole = roles.find((x) => x.roleId === roleId);

        // Can't delete non-existant role
        if (!existingRole) return res.status(404).json({ error: true, message: "Role by this ID is not a staff role in Yoki." });

        await prisma.role.deleteMany({
            where: {
                id: existingRole.id,
            },
        });

        return res.status(204);
    },
});

export default serverRolesRoute;
