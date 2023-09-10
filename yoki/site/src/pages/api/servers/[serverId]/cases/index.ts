import { Action, Server } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

import prisma from "../../../../../prisma";
import createServerRoute from "../../../../../utils/route";

const casesPerPage = 50;

const serverCasesRoute = createServerRoute({
    async GET(req, res, _session, server, _member) {
        return fetchCases(req, res, server);
    },
    async DELETE(req, res, _session, server, _member) {
        const { caseIds } = req.body;

        // Check query
        if (!Array.isArray(caseIds) || caseIds.some((x) => typeof x !== "string"))
            return res.status(400).json({ error: true, message: "Case IDs must be a string array" });

        // Just delete all of them
        await prisma.action
            .deleteMany({
                where: {
                    serverId: server.serverId,
                    id: {
                        in: caseIds,
                    },
                },
            });

        // To update the state
        return fetchCases(req, res, server);
    },
});

async function fetchCases(req: NextApiRequest, res: NextApiResponse, server: Server) {
    const { page: pageStr, search } = req.query;

    // Check query
    if (typeof pageStr !== "string")
        return res.status(400).json({ error: true, message: "Expected page single query" });

    const page = parseInt(pageStr, 10);

    if (typeof page !== "number" || page < 0)
        return res.status(400).json({ error: true, message: "Expected page to be a number that is at least 0." });
    else if (typeof search !== "undefined" && typeof search !== "string")
        return res.status(400).json({ error: true, message: "Expected search query to be a string." });

    const cases: Action[] = await prisma.action
        .findMany({
            where: {
                serverId: server.serverId,
            }
        });
    const foundCases = search ? cases.filter((x) => x.reason?.includes(search)) : cases;

    const startIndex = page * casesPerPage;
    const endIndex = (page + 1) * casesPerPage;

    return res.status(200).json({
        // To get rid of useless information
        cases: foundCases
            .slice(startIndex, endIndex)
            .map(({ logChannelId: _i, logChannelMessage: _m, ...rest }) => rest),
        count: foundCases.length
    });
}

export default serverCasesRoute;