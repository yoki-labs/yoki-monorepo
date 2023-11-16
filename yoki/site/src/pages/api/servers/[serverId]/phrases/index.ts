import { ContentFilter, Server } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

import prisma from "../../../../../prisma";
import { createServerRoute } from "../../../../../utils/routes/servers";

const casesPerPage = 50;

const serverCasesRoute = createServerRoute({
    async GET(req, res, _session, server, _member) {
        return fetchPhrases(req, res, server);
    },
    async DELETE(req, res, _session, server, _member) {
        const { phraseIds } = req.body;

        // Check query
        if (!Array.isArray(phraseIds) || phraseIds.some((x) => typeof x !== "number")) return res.status(400).json({ error: true, message: "Phrase IDs must be a number array" });

        // Just delete all of them
        await prisma.contentFilter.deleteMany({
            where: {
                serverId: server.serverId,
                id: {
                    in: phraseIds,
                },
            },
        });

        // To update the state
        return fetchPhrases(req, res, server);
    },
});

async function fetchPhrases(req: NextApiRequest, res: NextApiResponse, server: Server) {
    const { page: pageStr, search } = req.query;

    // Check query
    if (typeof pageStr !== "string") return res.status(400).json({ error: true, message: "Expected page single query" });

    const page = parseInt(pageStr, 10);

    if (typeof page !== "number" || page < 0) return res.status(400).json({ error: true, message: "Expected page to be a number that is at least 0." });
    else if (typeof search !== "undefined" && typeof search !== "string") return res.status(400).json({ error: true, message: "Expected search query to be a string." });

    const phrases: ContentFilter[] = await prisma.contentFilter.findMany({
        where: {
            serverId: server.serverId,
        },
    });
    const foundPhrases = search ? phrases.filter((x) => x.content?.includes(search)) : phrases;

    const startIndex = page * casesPerPage;
    const endIndex = (page + 1) * casesPerPage;

    return res.status(200).json({
        // To get rid of useless information
        phrases: foundPhrases.slice(startIndex, endIndex),
        count: foundPhrases.length,
    });
}

export default serverCasesRoute;
