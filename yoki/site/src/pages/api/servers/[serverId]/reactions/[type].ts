import { ReactionAction, ReactionActionType } from "@prisma/client";
import { getReactionById, isUUID } from "@yokilabs/utils";

import prisma from "../../../../../prisma";
import { getBodyErrorResponse, isBodyChannelPropertyValid, isBodyPropertyTypeInvalid } from "../../../../../utils/routes/body";
import { getServerTextChannels } from "../../../../../utils/routes/route";
import { createServerRoute } from "../../../../../utils/routes/servers";

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
    async PUT(req, res, _session, server, _member) {
        const { body } = req;
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

        // Check body
        if (isBodyPropertyTypeInvalid(body.emoteId, "number") || (typeof body.emoteId === "number" && !getReactionById(body.emoteId)))
            return getBodyErrorResponse(res, "emoteId", "emote ID");
        else if (!(await isBodyChannelPropertyValid(body.channelId))) return getBodyErrorResponse(res, "channelId", "channel ID");
        else if (isBodyPropertyTypeInvalid(body.messageId, "string") || (typeof body.messageId === "string" && !isUUID(body.messageId)))
            return getBodyErrorResponse(res, "messageId", "message ID");

        if (reactionAction)
            await prisma.reactionAction.update({
                where: {
                    id: reactionAction.id,
                },
                data: {
                    emoteId: body.emoteId ?? reactionAction?.emoteId,
                    messageId: body.messageId ?? reactionAction?.messageId,
                    channelId: body.channelId ?? reactionAction?.channelId,
                },
            });
        else if (body.emoteId && body.messageId && body.channelId)
            await prisma.reactionAction.create({
                data: {
                    serverId: server.serverId,
                    emoteId: body.emoteId,
                    messageId: body.messageId,
                    channelId: body.channelId,
                    actionType,
                },
            });
        else return res.status(400).json({ error: true, message: "Expected either emoteId, messageId and channelId in the body or reaction action already existing" });

        return res.status(200).json({});
    },
});

export default serverReactionsRoute;
