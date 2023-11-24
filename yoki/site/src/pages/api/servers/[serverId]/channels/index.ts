import { getServerTextChannels } from "../../../../../utils/routes/route";
import { createServerRoute } from "../../../../../utils/routes/servers";

const serverCasesRoute = createServerRoute({
    async GET(_req, res, _session, server, _member) {
        const serverChannels = await getServerTextChannels(server.serverId);

        return res.status(200).json({
            serverChannels,
        });
    },
});

export default serverCasesRoute;
