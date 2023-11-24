import { UrlFilter } from "@prisma/client";

import { clientRest } from "../../../../../guilded";
import prisma from "../../../../../prisma";
import { createServerDataRoute } from "../../../../../utils/routes/servers";

const serverUrlsRoute = createServerDataRoute<UrlFilter, number>({
    type: "number",
    searchFilter(value, search) {
        return value.domain.includes(search) || value.route?.includes(search) || value.subdomain?.includes(search) || false;
    },
    fetchMany(serverId) {
        return prisma.urlFilter.findMany({
            where: {
                serverId,
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
