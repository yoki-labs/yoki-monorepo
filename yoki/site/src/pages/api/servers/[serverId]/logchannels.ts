import { WebhookEmbed } from "@guildedjs/api";
import { stripIndents } from "common-tags";
import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";

import rest from "../../../../guilded";
import errorHandler, { errorEmbed } from "../../../../lib/ErrorHandler";
import prisma from "../../../../prisma";
import { authOptions } from "../../auth/[...nextauth]";
import { LogChannel, RoleType } from "@prisma/client";

const GetLogsRoute = async (req: NextApiRequest, res: NextApiResponse) => {
    // Has to be POST; this is the only method available
    if (req.method !== "GET")
        return res.status(405).send("");
    const serverId = req.query.serverId as string;

    // Don't know who is appealing (need a Guilded login)
    const session = await unstable_getServerSession(req, res, authOptions);
    if (!session?.user.id)
        return res.status(401).json({ error: true, message: "Must be logged in to send appeal." });

    // Server needs to exist and have appeals enabled
    const server = await prisma.server.findFirst({ where: { serverId } });
    if (!server)
        return res.status(404).json({ error: true, message: "Invalid server ID." });
    
    // If they don't have a proper role to manage the server, then don't allow using dashboard functions
    const member = await rest.router.members
        .serverMemberRead({ serverId: server.serverId, userId: session.user.id })
        .then((x) => x.member)
        .catch(() => null);

    // Pretend server doesn't exist by also giving 404 instead of 403
    // Not much use for privacy, but just giving less info I guess
    if (!member)
        return res.status(404).json({ error: true, message: "Invalid server ID." });

    const adminRoles = await prisma.role
        .findMany({
            where: {
                serverId: server.serverId,
                type: RoleType.ADMIN,
            }
        })
        .then((roles) =>
            roles.map((role) => role.roleId)
        );

    if (!(member?.isOwner || member?.roleIds.find((x) => adminRoles.includes(x))))
        return res.status(403).json({ error: true, code: "NOT_STAFF", message: "User does not have ADMIN access level." });

    const logChannels = await prisma.logChannel
        .findMany({
            where: {
                serverId: server.serverId,
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
};

export default GetLogsRoute;
