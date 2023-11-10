import { clientRest } from "../../../../../guilded";
import { GuildedClientChannel, GuildedSanitizedChannel } from "../../../../../lib/@types/guilded";
import prisma from "../../../../../prisma";
import createServerRoute from "../../../../../utils/route";

const textChannelTypes = ["chat", "voice", "stream"]

const serverLogsRoute = createServerRoute({
    async GET(_req, res, _session, server, _member) {
        const logChannels = await prisma.logChannel.findMany({
            where: {
                serverId: server.serverId,
            },
        });

        const { channels: unfilteredChannels } = (await clientRest.get(`/teams/${server.serverId}/channels`, { excludeBadgedContent: true })) as { channels: GuildedClientChannel[] };
        const textChannels =
            unfilteredChannels
                .filter((x) =>
                    textChannelTypes.includes(x.contentType) && !x.archivedAt
                )
                .map(({ id, contentType, name, description, priority, groupId, isPublic, createdBy }) => ({
                    id,
                    contentType,
                    name,
                    description,
                    priority,
                    groupId,
                    isPublic,
                    createdBy
                })) as GuildedSanitizedChannel[];

        return res.status(200).json({
            // To get rid of things like tokens and useless information
            logs: logChannels.map(({ serverId, channelId, type, createdAt }) => ({
                serverId,
                channelId,
                type,
                createdAt,
            })),
            serverChannels: textChannels,
        });
    },
});

export default serverLogsRoute;
