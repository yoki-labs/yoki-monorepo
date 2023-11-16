import { Appeal } from "@prisma/client";
import { createServerDataRoute } from "../../../../../utils/routes/servers";
import prisma from "../../../../../prisma";

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
});;

export default serverAppealsRoute;
