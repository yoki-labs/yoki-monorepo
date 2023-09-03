import { LogChannel, LogChannelType } from "@prisma/client";
import prisma from "../../../../../prisma";
import createServerRoute from "../../../../../utils/route";
import { isUUID } from "@yokilabs/utils";
import rest from "../../../../../guilded";

const serverLogsRoute = createServerRoute({
    async DELETE(req, res, _session, { serverId} , _member) {
        const { logId } = req.query;

        // Check query
        if (typeof logId !== "string")
            return res.status(400).json({ error: true, message: "Log channel ID must be a string" });

        const logChannels = await prisma.logChannel
            .findMany({
                where: {
                    serverId: serverId,
                }
            });

        const existingLog = logChannels.find((x) => x.channelId === logId);

        // Can't delete non-existant case
        if (!existingLog)
            return res.status(404).json({ error: true, message: "Log channel by this ID does not exist." });

        await prisma.logChannel.deleteMany({
            where: {
                serverId: serverId,
                channelId: existingLog.channelId,
            }
        });

        return res.status(200).json({
            // To get rid of things like tokens and useless information
            logs: logChannels.map(({ serverId, channelId, type, createdAt }) => ({
                serverId,
                channelId,
                type,
                createdAt,
            }))
        });
    },
    async PUT(req, res, _session, { serverId }, _member) {
        const { logId } = req.query;
        const types = req.body.types;

        // Check query
        if (typeof logId !== "string")
            return res.status(400).json({ error: true, message: "Log channel ID must be a string" });
        else if (!isUUID(logId))
            return res.status(400).json({ error: true, message: "Log channel ID must be a UUID" });
        else if (!Array.isArray(types) || types.some((x) => typeof x !== "string") || types.some((x) => !LogChannelType[x as LogChannelType]))
            return res.status(400).json({ error: true, message: "Log channel types must be a string array" });

        const logChannels = await prisma.logChannel
            .findMany({
                where: {
                    serverId: serverId,
                }
            });

        const existingLogs = logChannels.filter((x) => x.channelId === logId);
        
        const existingLogTypes = existingLogs.map((x) => x.type);

        const logsToAdd = types.filter((type) => !existingLogTypes.includes(type as LogChannelType));
        const logsToRemove = existingLogs.filter((log) => !types.includes(log.type)).map((x) => x.id);

        // Nothing to update; both empty arrays
        if (!(logsToAdd.length || logsToRemove.length))
            return res.status(400).json({ error: true, message: "Nothing to update in types." });
        // Can't delete non-existant log
        // This check is exclusively to ditch DELETE route and allow us to just do it all in PUT
        else if (!(existingLogs.length || logsToAdd.length))
            return res.status(404).json({ error: true, message: "Any log by this channel ID does not exist." });
        // Make sure channel exists
        else if (!existingLogs.length && !await channelExists(logId))
            return res.status(404).json({ error: true, message: "Channel by that ID does not exist, bot has no permission to see it or there was an error while fetching it." });

        await Promise.all([
            logsToAdd.length && prisma.logChannel.createMany({
                data: logsToAdd.map((x) => ({
                    serverId: serverId,
                    channelId: logId,
                    type: x as LogChannelType,
                }))
            }),
            logsToRemove.length && prisma.logChannel.deleteMany({
                where: {
                    id: {
                        in: logsToRemove,
                    }
                }
            }),
        ]);

        const creationDate = new Date();

        const newLogChannels =
            logChannels
                .filter((x) => !logsToRemove.includes(x.id))
                .map(({ serverId, createdAt, channelId, type }) => ({ serverId, createdAt, channelId, type }))
                .concat(...logsToAdd.map((x) =>
                    ({
                        channelId: logId,
                        createdAt: creationDate,
                        serverId,
                        type: x as LogChannelType,
                    })
                ));

        return res.status(200).json({
            // To get rid of things like tokens and useless information
            logs: newLogChannels,
        });
    }
});

const channelExists = async (channelId: string) =>
    rest.router.channels
        .channelRead({ channelId })
        .then(() => true)
        .catch(() => false);

export default serverLogsRoute;