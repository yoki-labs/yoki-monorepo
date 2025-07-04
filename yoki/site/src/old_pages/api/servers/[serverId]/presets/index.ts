import { Preset, RoleType } from "@prisma/client";

import prisma from "../../../../../prisma";
import { createServerRoute } from "../../../../../utils/routes/servers";

const serverPresetsRoute = createServerRoute({
    requiredRoles: {
        GET: RoleType.MOD,
    },
    methods: {
        async GET(_req, res, _session, server, _member) {
            const presets: Preset[] = await prisma.preset.findMany({
                where: {
                    serverId: server.serverId,
                },
            });

            return res.status(200).json({
                // To get rid of useless information
                presets: presets.map(({ id: _, ...rest }) => rest),
            });
        },
    },
});

export default serverPresetsRoute;
