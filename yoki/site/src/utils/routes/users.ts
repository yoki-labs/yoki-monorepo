import { NextApiRequest, NextApiResponse } from "next";
import { Session, unstable_getServerSession } from "next-auth";

import { LabsSessionUser } from "../pageUtil";
import { GuildedClientServer, GuildedServer } from "../../lib/@types/guilded";
import { authOptions } from "../../pages/api/auth/[...nextauth]";

type UserRouteFunction = (req: NextApiRequest, res: NextApiResponse, session: Session | null, user: LabsSessionUser) => Promise<unknown>;
type UserRouteInfo = Record<string, UserRouteFunction>;

export function createUserRoute(methodToFunction: UserRouteInfo) {
    return async function onRequest(req: NextApiRequest, res: NextApiResponse) {
        // Has to be allowed method; this is the only method available
        if (!(req.method && Object.hasOwn(methodToFunction, req.method))) return res.status(405).send("");

        // Don't know who is appealing (need a Guilded login)
        const session = await unstable_getServerSession(req, res, authOptions);
        if (!session?.user.id) return res.status(401).json({ error: true, message: "Must be logged in to use this function." });

        return methodToFunction[req.method](req, res, session, { id: session.user.id!, name: session.user.name, avatar: session.user.avatar });
    };
}

export const transformFoundServer = (server: GuildedClientServer | undefined): GuildedServer | undefined => server && transformServer(server);

export function transformServer({ id, name, subdomain, profilePicture }: GuildedClientServer): GuildedServer {
    return { id, name, url: subdomain, avatar: profilePicture ?? undefined };
}
