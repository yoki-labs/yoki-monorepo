import { Action, Severity } from "@prisma/client";

import { clientRest } from "../../../../../guilded";
import prisma from "../../../../../prisma";
import { createServerDataRoute } from "../../../../../utils/routes/servers";
import { availableSeverityValues } from "../../../../../utils/routes/body";

const serverCasesRoute = createServerDataRoute<Action, string>({
    type: "string",
    searchFilter(value, search) {
        return value.reason?.includes(search) || false;
    },
    async fetchMany(serverId, query) {
        // Invalid severity filter
        if (query.severity && !availableSeverityValues.includes(query.severity as string))
            return null;

        const severity = query.severity ? Severity[query.severity as Severity] : undefined;

        return prisma.action.findMany({
            where: {
                serverId,
                type: severity,
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
