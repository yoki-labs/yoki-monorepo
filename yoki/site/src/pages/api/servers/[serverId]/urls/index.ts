import { RoleType, Severity, UrlFilter } from "@prisma/client";

import { clientRest } from "../../../../../guilded";
import prisma from "../../../../../prisma";
import { querySeverityIsIncorrect, queryUserIsIncorrect } from "../../../../../utils/routes/body";
import { createServerDataRoute } from "../../../../../utils/routes/servers";

const serverUrlsRoute = createServerDataRoute<UrlFilter, number>({
    type: "number",
    fetchRoleRequired: RoleType.MOD,
    operationRoleRequired: RoleType.ADMIN,
    searchFilter(value, search) {
        return value.domain.includes(search) || value.route?.includes(search) || value.subdomain?.includes(search) || false;
    },
    async fetchMany(serverId, query) {
        if (querySeverityIsIncorrect(query.severity) || queryUserIsIncorrect(query.user)) return null;

        const severity = query.severity ? Severity[query.severity as Severity] : undefined;
        const user = (query.user || undefined) as string | undefined;

        return prisma.urlFilter.findMany({
            where: {
                serverId,
                severity,
                creatorId: user,
            },
        });
    },
    deleteMany(serverId, ids) {
        return prisma.urlFilter.deleteMany({
            where: {
                serverId,
                id: {
                    in: ids,
                },
            },
        });
    },
    async fetchUsers(serverId, urls) {
        const userIds = Array.from(new Set(urls.map((x) => x.creatorId)));

        return clientRest.post(`/teams/${serverId}/members/detail`, {
            idsForBasicInfo: userIds,
            userIds: [],
        });
    },
});

export default serverUrlsRoute;
