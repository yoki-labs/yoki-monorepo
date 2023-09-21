import prisma from "../../../../../prisma";
import createServerRoute from "../../../../../utils/route";

const serverLogsRoute = createServerRoute({
    async GET(_req, res, _session, server, _member) {
        const logChannels = await prisma.logChannel.findMany({
            where: {
                serverId: server.serverId,
            },
        });

        return res.status(200).json({
            // To get rid of things like tokens and useless information
            logs: logChannels.map(({ serverId, channelId, type, createdAt }) => ({
                serverId,
                channelId,
                type,
                createdAt,
            })),
        });
    },
});

export default serverLogsRoute;
