import { InviteFilter } from "@prisma/client";

import { clientRest } from "../../../../../guilded";
import prisma from "../../../../../prisma";
import { createServerDataRoute } from "../../../../../utils/routes/servers";

const serverInvitesRoute = createServerDataRoute<InviteFilter, number>({
    type: "number",
    searchFilter(value, search) {
        return value.targetServerId.includes(search);
    },
    fetchMany(serverId) {
        return prisma.inviteFilter.findMany({
            where: {
                serverId,
            },
        });
    },
    deleteMany(serverId, ids) {
        return prisma.inviteFilter.deleteMany({
            where: {
                serverId,
                id: {
                    in: ids,
                },
            },
        });
    },
    async fetchUsers(serverId, invites) {
        const userIds = Array.from(new Set(invites.map((x) => x.creatorId)));

        return clientRest.post(`/teams/${serverId}/members/detail`, {
            idsForBasicInfo: userIds,
            userIds: [],
        });
    },
});

export default serverInvitesRoute;
