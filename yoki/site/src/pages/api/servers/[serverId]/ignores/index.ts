import { RoleType } from "@prisma/client";

import prisma from "../../../../../prisma";
import { createServerRoute } from "../../../../../utils/routes/servers";
import { getServerTextChannels } from "../../../../../utils/routes/route";

const serverIgnoresRoute = createServerRoute({
    requiredRoles: {
        GET: RoleType.MOD,
    },
    methods: {
        async GET(_req, res, _session, server, _member) {
            const ignores = await prisma.channelIgnore.findMany({
                where: {
                    serverId: server.serverId,
                },
            });

            const textChannels = await getServerTextChannels(server.serverId);

            return res.status(200).json({
                // To get rid of things like tokens and useless information
                items: ignores.map(({ serverId, channelId, contentType, type, createdAt, updatedAt }) => ({
                    serverId,
                    channelId,
                    contentType,
                    type,
                    createdAt,
                    updatedAt,
                })),
                serverChannels: textChannels,
            });
        },
    },
});

export default serverIgnoresRoute;
