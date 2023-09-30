import { ServerMember } from "@guildedjs/api/types/generated/router/models/ServerMember";
import { RoleType, Server } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { Session, unstable_getServerSession } from "next-auth";

import rest from "../guilded";
import { authOptions } from "../pages/api/auth/[...nextauth]";
import prisma from "../prisma";
import { GuildedClientServer, GuildedServer } from "../lib/@types/guilded";

type RouteFunction = (req: NextApiRequest, res: NextApiResponse, session: Session | null, server: Server, member: ServerMember) => Promise<unknown>;

type RouteInfo = Record<string, RouteFunction>;

export default function createServerRoute(methodToFunction: RouteInfo) {
    return async function onRequest(req: NextApiRequest, res: NextApiResponse) {
        // Has to be allowed method; this is the only method available
        if (!(req.method && Object.hasOwn(methodToFunction, req.method))) return res.status(405).send("");

        const serverId = req.query.serverId as string;

        // Don't know who is appealing (need a Guilded login)
        const session = await unstable_getServerSession(req, res, authOptions);
        if (!session?.user.id) return res.status(401).json({ error: true, message: "Must be logged in to use this function." });

        // Server needs to exist
        const server = await prisma.server.findFirst({ where: { serverId } });
        if (!server) return res.status(404).json({ error: true, message: "Invalid server ID." });
        // Allow only given beta access
        else if (!server.flags.includes("EARLY_ACCESS")) return res.status(403).json({ error: true, message: "Server does not have early access flag to use this." });

        // If they don't have a proper role to manage the server, then don't allow using dashboard functions
        const member = await rest.router.members
            .serverMemberRead({ serverId: server.serverId, userId: session.user.id })
            .then((x) => x.member)
            .catch(() => null);

        // Pretend server doesn't exist by also giving 404 instead of 403
        // Not much use for privacy, but just giving less info I guess
        if (!member) return res.status(404).json({ error: true, message: "Invalid server ID." });

        const adminRoles = await prisma.role
            .findMany({
                where: {
                    serverId: server.serverId,
                    type: RoleType.ADMIN,
                },
            })
            .then((roles) => roles.map((role) => role.roleId));

        if (!(member?.isOwner || member?.roleIds.find((x) => adminRoles.includes(x))))
            return res.status(403).json({ error: true, code: "NOT_STAFF", message: "User does not have ADMIN access level." });

        return methodToFunction[req.method](req, res, session, server, member);
    };
}

export const allowedRoleTypes = [RoleType.ADMIN, RoleType.MOD, RoleType.MINIMOD];

export async function roleExistsInServer(serverId: string, roleId: number) {
    const { roles: serverRoles } = await rest.router.roles.roleReadMany({ serverId });

    return serverRoles.find((x) => x.id === roleId);
}

export const channelExistsInServer = async (channelId: string) =>
    rest.router.channels
        .channelRead({ channelId })
        .then(() => true)
        .catch(() => false);

export const transformFoundServer = (server: GuildedClientServer | undefined): GuildedServer | undefined =>
    server && transformServer(server);

export function transformServer({ id, name, subdomain, profilePicture }: GuildedClientServer): GuildedServer {
    return { id, name, url: subdomain, avatar: profilePicture ?? undefined };
}