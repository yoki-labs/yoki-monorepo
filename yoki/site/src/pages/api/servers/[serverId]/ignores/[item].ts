import { ChannelIgnore, ChannelIgnoreType, ContentIgnoreType, LogChannelType, RoleType } from "@prisma/client";
import { isUUID } from "@yokilabs/utils";

import prisma from "../../../../../prisma";
import { channelExistsInServer } from "../../../../../utils/routes/route";
import { createServerRoute } from "../../../../../utils/routes/servers";

const contentIgnoreTypes = Object.keys(ContentIgnoreType);

const serverIgnoresRoute = createServerRoute({
    requiredRoles: {
        PUT: RoleType.ADMIN,
        DELETE: RoleType.ADMIN,
    },
    methods: {
        async DELETE(req, res, _session, { serverId }, _member) {
            const { item } = req.query;

            // Check query
            if (typeof item !== "string" || !(isUUID(item) || contentIgnoreTypes.includes(item))) return res.status(400).json({ error: true, message: "Ignore item must be a content type or channel ID" });

            const ignores = await prisma.channelIgnore.findMany({
                where: {
                    serverId,
                },
            });

            const existingIgnore = ignores.find((x) => x.contentType === item || x.channelId === item);

            // Can't delete non-existant case
            if (!existingIgnore) return res.status(404).json({ error: true, message: "Cannot find content ignore by that channel ID or content type." });

            const isContentIgnore = contentIgnoreTypes.includes(item);

            await prisma.channelIgnore.deleteMany({
                where: {
                    serverId,
                    channelId: isContentIgnore ? undefined : item,
                    contentType: isContentIgnore ? ContentIgnoreType[item as ContentIgnoreType] : undefined,
                },
            });

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
            });
        },
        async PUT(req, res, _session, { serverId }, _member) {
            const { item } = req.query;
            const { types } = req.body;

            // Check query
            if (typeof item !== "string" || !(isUUID(item) || contentIgnoreTypes.includes(item))) return res.status(400).json({ error: true, message: "Ignore item must be a content type or channel ID" });
            else if (!Array.isArray(types) || types.some((x) => typeof x !== "string") || types.some((x) => !ChannelIgnoreType[x as ChannelIgnoreType]))
                return res.status(400).json({ error: true, message: "Log channel types must be a string array" });

            const ignores = await prisma.channelIgnore.findMany({
                where: {
                    serverId,
                },
            });

            const isContentType = contentIgnoreTypes.includes(item);
            const contentType = isContentType ? ContentIgnoreType[item as ContentIgnoreType] : null;            
            const channelId = isContentType ? null : item;            

            const existingIgnores = ignores.filter((x) => x.channelId === channelId && x.contentType === contentType);

            const existingIgnoreTypes = existingIgnores.map((x) => x.type);

            const ignoresToAdd = types.filter((type) => !existingIgnoreTypes.includes(type as ChannelIgnoreType));
            const ignoresToRemove = existingIgnores.filter((ignore) => !types.includes(ignore.type)).map((x) => x.id);

            // Nothing to update; both empty arrays
            if (!(ignoresToAdd.length || ignoresToRemove.length)) return res.status(400).json({ error: true, message: "Nothing to update in types." });
            // Can't delete non-existant ignore
            // This check is exclusively to ditch DELETE route and allow us to just do it all in PUT
            else if (!(existingIgnores.length || ignoresToAdd.length)) return res.status(404).json({ error: true, message: "Any ignore by this channel ID or content type does not exist." });
            // Make sure channel exists
            else if (!existingIgnores.length && channelId && !(await channelExistsInServer(channelId)))
                return res
                    .status(404)
                    .json({ error: true, message: "Channel by that ID does not exist, bot has no permission to see it or there was an error while fetching it." });

            await Promise.all([
                ignoresToAdd.length &&
                    prisma.channelIgnore.createMany({
                        data: ignoresToAdd.map((x) => ({
                            serverId,
                            channelId,
                            contentType,
                            type: x as ChannelIgnoreType,
                        })),
                    }),
                ignoresToRemove.length &&
                    prisma.channelIgnore.deleteMany({
                        where: {
                            id: {
                                in: ignoresToRemove,
                            },
                        },
                    }),
            ]);

            const creationDate = new Date();

            const newIgnores = ignores
                .filter((x) => !ignoresToRemove.includes(x.id))
                .map(({ serverId, createdAt, channelId, contentType, type }) => ({ serverId, createdAt, channelId, contentType, type }))
                .concat(
                    ...ignoresToAdd.map((x) => ({
                        channelId,
                        contentType,
                        createdAt: creationDate,
                        serverId,
                        type: x as ChannelIgnoreType,
                    }))
                );

            return res.status(200).json({
                // To get rid of things like tokens and useless information
                items: newIgnores,
            });
        },
    },
});

export default serverIgnoresRoute;
