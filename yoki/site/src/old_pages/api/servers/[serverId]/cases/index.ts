import { Action, RoleType, Severity } from "@prisma/client";

import { clientRest } from "../../../../../guilded";
import prisma from "../../../../../prisma";
import { querySeverityIsIncorrect, queryUserIsIncorrect } from "../../../../../utils/routes/body";
import { createServerDataRoute } from "../../../../../utils/routes/servers";

const serverCasesRoute = createServerDataRoute<Action, string>({
    type: "string",
    fetchRoleRequired: RoleType.MINIMOD,
    operationRoleRequired: RoleType.MINIMOD,
    searchFilter(value, search) {
        return value.reason?.includes(search) || false;
    },
    async fetchMany(serverId, query) {
        // Invalid severity filter
        if (querySeverityIsIncorrect(query.severity) || queryUserIsIncorrect(query.target)) return null;

        const severity = query.severity ? Severity[query.severity as Severity] : undefined;
        const targetUser = (query.target || undefined) as string | undefined;

        return await prisma.action.findMany({
            where: {
                serverId,
                type: severity,
                targetId: targetUser,
            },
        });
    },
    deleteMany(serverId, ids) {
        return prisma.action.deleteMany({
            where: {
                serverId,
                id: {
                    in: ids,
                },
            },
        });
    },
    async fetchUsers(serverId, urls) {
        const userIds = Array.from(new Set([...urls.map((x) => x.executorId), ...urls.map((x) => x.targetId)]));

        return clientRest.post(`/teams/${serverId}/members/detail`, {
            idsForBasicInfo: userIds,
            userIds: [],
        });
    },
});

export default serverCasesRoute;
