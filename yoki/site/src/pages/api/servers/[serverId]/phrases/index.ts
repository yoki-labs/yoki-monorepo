import { ContentFilter, Severity } from "@prisma/client";

import { clientRest } from "../../../../../guilded";
import prisma from "../../../../../prisma";
import { createServerDataRoute } from "../../../../../utils/routes/servers";
import { querySeverityIsIncorrect, queryUserIsIncorrect } from "../../../../../utils/routes/body";

const serverPhrasesRoute = createServerDataRoute<ContentFilter, number>({
    type: "number",
    searchFilter(value, search) {
        return value.content.includes(search);
    },
    async fetchMany(serverId, query) {
        if (queryUserIsIncorrect(query.user) || querySeverityIsIncorrect(query.severity))
            return null;

        const severity = query.severity ? Severity[query.severity as Severity] : undefined;
        const user = (query.user || undefined) as string | undefined;

        return prisma.contentFilter.findMany({
            where: {
                serverId,
                creatorId: user,
                severity,
            },
        });
    },
    deleteMany(serverId, ids) {
        return prisma.contentFilter.deleteMany({
            where: {
                serverId,
                id: {
                    in: ids,
                },
            },
        });
    },
    async fetchUsers(serverId, phrases) {
        const userIds = Array.from(new Set(phrases.map((x) => x.creatorId)));

        return clientRest.post(`/teams/${serverId}/members/detail`, {
            idsForBasicInfo: userIds,
            userIds: [],
        });
    },
});

export default serverPhrasesRoute;
