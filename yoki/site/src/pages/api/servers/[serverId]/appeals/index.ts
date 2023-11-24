import { Appeal } from "@prisma/client";
import { createServerDataRoute } from "../../../../../utils/routes/servers";
import prisma from "../../../../../prisma";
import { clientRest } from "../../../../../guilded";

const serverAppealsRoute = createServerDataRoute<Appeal, number>({
    type: "number",
    searchFilter(value, search) {
        return value.content?.includes(search);
    },
    fetchMany(serverId) {
        return prisma.appeal.findMany({
            where: {
                serverId,
            },
        });
    },
    deleteMany(serverId, ids) {
        return prisma.appeal.deleteMany({
            where: {
                serverId,
                id: {
                    in: ids,
                },
            },
        });
    },
    async fetchUsers(serverId, appeals) {
        const userIds = Array.from(new Set(appeals.map((x) => x.creatorId)));

        return clientRest.post(`/teams/${serverId}/members/detail`, {
            idsForBasicInfo: userIds,
            userIds: [],
        });
    },
});;

export default serverAppealsRoute;
