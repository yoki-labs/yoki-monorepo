import { ReactionAction, ReactionActionType } from "@prisma/client";

import prisma from "../../../../../prisma";
import { createServerRoute } from "../../../../../utils/routes/servers";
import { getServerTextChannels } from "../../../../../utils/routes/route";

const serverReactionsRoute = createServerRoute({
    async GET(req, res, _session, server, _member) {
        const { type: typeStr } = req.query;

        // Check query
        if (typeof typeStr !== "string") return res.status(400).json({ error: true, message: "Expected reaction action type to be a string" });
        
        const actionType = (ReactionActionType as Record<string, ReactionActionType>)[typeStr];

        if (!actionType) return res.status(400).json({ error: true, message: "Expected reaction action type to be a valid reaction action type" });

        const reactionAction: ReactionAction | null = await prisma.reactionAction.findFirst({
            where: {
                serverId: server.serverId,
                actionType,
            },
        });

        const serverChannels = await getServerTextChannels(server.serverId);

        return res.status(200).json({
            reactionAction,
            serverChannels,
        });
    },
    async PATCH(req, res, _session, server, _member) {
    },
});

export default serverReactionsRoute;
