import { InviteFilter } from "@prisma/client";
import { createServerDataRoute } from "../../../../../utils/routes/servers";
import prisma from "../../../../../prisma";

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
});;

export default serverInvitesRoute;
