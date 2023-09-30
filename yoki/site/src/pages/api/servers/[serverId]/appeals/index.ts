import { Appeal, Server } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

import prisma from "../../../../../prisma";
import createServerRoute from "../../../../../utils/route";

const appealsPerPage = 50;

const serverAppealsRoute = createServerRoute({
    async GET(req, res, _session, server, _member) {
        return fetchAppeals(req, res, server);
    },
    async DELETE(req, res, _session, server, _member) {
        const { appealIds } = req.body;

        // Check query
        if (!Array.isArray(appealIds) || appealIds.some((x) => typeof x !== "number")) return res.status(400).json({ error: true, message: "appealIds must be a number array" });

        // Just delete all of them
        await prisma.appeal.deleteMany({
            where: {
                serverId: server.serverId,
                id: {
                    in: appealIds,
                },
            },
        });

        // To update the state
        return fetchAppeals(req, res, server);
    },
});

async function fetchAppeals(req: NextApiRequest, res: NextApiResponse, server: Server) {
    const { page: pageStr, search } = req.query;

    // Check query
    if (typeof pageStr !== "string") return res.status(400).json({ error: true, message: "Expected page single query" });

    const page = parseInt(pageStr, 10);

    if (typeof page !== "number" || page < 0) return res.status(400).json({ error: true, message: "Expected page to be a number that is at least 0." });
    else if (typeof search !== "undefined" && typeof search !== "string") return res.status(400).json({ error: true, message: "Expected search query to be a string." });

    const appeals: Appeal[] = await prisma.appeal.findMany({
        where: {
            serverId: server.serverId,
        },
    });
    const foundAppeals = search ? appeals.filter((x) => x.content?.includes(search)) : appeals;

    const startIndex = page * appealsPerPage;
    const endIndex = (page + 1) * appealsPerPage;

    return res.status(200).json({
        // To get rid of useless information
        appeals: foundAppeals.slice(startIndex, endIndex),
        count: foundAppeals.length,
    });
}

export default serverAppealsRoute;
