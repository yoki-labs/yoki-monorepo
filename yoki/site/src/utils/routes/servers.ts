import { ServerMember } from "@guildedjs/api/types/generated/router/models/ServerMember";
import { RoleType, Server } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { Session, unstable_getServerSession } from "next-auth";

import { sanitizeUserDetails } from "./transform";
import rest from "../../guilded";
import { GuildedUserDetail } from "../../lib/@types/guilded";
import { authOptions } from "../../pages/api/auth/[...nextauth]";
import prisma from "../../prisma";
import { roleTypeLevels } from "./permissions";

type ServerRouteFunction = (req: NextApiRequest, res: NextApiResponse, session: Session | null, server: Server, member: ServerMember) => Promise<unknown>;
type ServerRouteInfo<T extends string> = Record<T, ServerRouteFunction>;
type ServerRouteProps<T extends string> = {
    methods: ServerRouteInfo<T>;
    requiredRoles: Record<T, RoleType>;
};

export function createServerRoute<T extends string>({ methods, requiredRoles }: ServerRouteProps<T>) {
    return async function onRequest(req: NextApiRequest, res: NextApiResponse) {
        // Has to be allowed method; this is the only method available
        if (!(req.method && Object.hasOwn(methods, req.method))) return res.status(405).send("");

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

        const methodRequiredRoleLevel = roleTypeLevels[requiredRoles[req.method as T] as RoleType];

        const adminRoles = await prisma.role
            .findMany({
                where: {
                    serverId: server.serverId,
                    // type: RoleType.ADMIN,
                },
            })
            .then((roles) => roles.filter((role) => roleTypeLevels[role.type] >= methodRequiredRoleLevel).map((role) => role.roleId));

        if (!(member?.isOwner || member?.roleIds.find((x) => adminRoles.includes(x))))
            return res.status(403).json({ error: true, code: "NOT_STAFF", message: `User does not have required role level (ADMIN/MOD/MINIMOD).` });

        return methods[req.method as T](req, res, session, server, member);
    };
}

interface DataRouteInfo<TItem extends { id: TId }, TId> {
    type: string;
    fetchRoleRequired: RoleType;
    operationRoleRequired: RoleType;
    searchFilter: (value: TItem, search: string, index: number, array: TItem[]) => boolean;
    fetchMany: (serverId: string, query: Partial<{ [key: string]: string | string[] }>) => Promise<TItem[] | null>;
    deleteMany: (serverId: string, ids: TId[]) => Promise<unknown>;
    fetchUsers?: (serverId: string, items: TItem[]) => Promise<Record<string, GuildedUserDetail>>;
}

export function createServerDataRoute<TItem extends { id: TId }, TId>({ type, fetchRoleRequired, operationRoleRequired, searchFilter, fetchMany, deleteMany, fetchUsers }: DataRouteInfo<TItem, TId>) {
    async function fetch(req: NextApiRequest, res: NextApiResponse, server: Server) {
        const { page: pageStr, search } = req.query;

        // Check query
        if (typeof pageStr !== "string") return res.status(400).json({ error: true, message: "Expected page single query" });

        const page = parseInt(pageStr, 10);

        if (typeof page !== "number" || page < 0) return res.status(400).json({ error: true, message: "Expected page to be a number that is at least 0." });
        else if (typeof search !== "undefined" && typeof search !== "string") return res.status(400).json({ error: true, message: "Expected search query to be a string." });

        const items: TItem[] | null = await fetchMany(server.serverId, req.query);

        // To allow catching invalid filters
        if (!items) return res.status(400).json({ error: true, message: "Couldn't fetch items due to an error in one of the queries" });

        const foundItems = search ? items.filter((value, index, array) => searchFilter(value, search, index, array)) : items;

        const startIndex = page * 50;
        const endIndex = (page + 1) * 50;

        const users = foundItems.length && fetchUsers ? sanitizeUserDetails(await fetchUsers(server.serverId, foundItems)) : undefined;

        return res.status(200).json({
            // To get rid of useless information
            items: foundItems.slice(startIndex, endIndex),
            count: foundItems.length,
            users,
        });
    }

    return createServerRoute({
        requiredRoles: {
            GET: fetchRoleRequired,
            DELETE: operationRoleRequired
        },
        methods: {
            async GET(req, res, _session, server, _member) {
                return fetch(req, res, server);
            },
            async DELETE(req, res, _session, server, _member) {
                const { ids } = req.body;

                console.log("Ids", { ids, type });

                // Check query
                if (!Array.isArray(ids) || ids.some((x) => typeof x !== type)) return res.status(400).json({ error: true, message: `ids must be a ${type} array` });

                // Just delete all of them
                await deleteMany(server.serverId, ids);

                // To update the state
                return fetch(req, res, server);
            },
        }
    });
}
