import { Action, Role } from "@prisma/client";
import prisma from "../../../../prisma";
import createServerRoute from "../../../../utils/route";
import rest from "../../../../guilded";

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
    }
});

export default serverRolesRoute;