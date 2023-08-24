import { Preset } from "@prisma/client";
import prisma from "../../../../../prisma";
import createServerRoute from "../../../../../utils/route";

const serverPresetsRoute = createServerRoute({
    async GET(_req, res, _session, server, _member) {
        const presets: Preset[] = await prisma.preset
            .findMany({
                where: {
                    serverId: server.serverId,
                }
            });

        return res.status(200).json({
            // To get rid of useless information
            presets: presets
                .map(({ id, ...rest }) => rest),
        });
    }
});

export default serverPresetsRoute;