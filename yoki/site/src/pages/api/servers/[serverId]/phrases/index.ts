import { ContentFilter } from "@prisma/client";

import { clientRest } from "../../../../../guilded";
import prisma from "../../../../../prisma";
import { createServerDataRoute } from "../../../../../utils/routes/servers";

const serverPhrasesRoute = createServerDataRoute<ContentFilter, number>({
    type: "number",
    searchFilter(value, search) {
        return value.content.includes(search);
    },
    fetchMany(serverId) {
        return prisma.contentFilter.findMany({
            where: {
                serverId,
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
