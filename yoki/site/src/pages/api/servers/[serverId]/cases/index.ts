import { Action } from "@prisma/client";
import { createServerDataRoute } from "../../../../../utils/routes/servers";
import prisma from "../../../../../prisma";
import { clientRest } from "../../../../../guilded";

const serverCasesRoute = createServerDataRoute<Action, string>({
    type: "string",
    searchFilter(value, search) {
        return value.reason?.includes(search) || false;
    },
    fetchMany(serverId) {
        return prisma.action.findMany({
            where: {
                serverId,
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
});;

export default serverCasesRoute;
