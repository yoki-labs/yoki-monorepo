import { Server, UrlFilter } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

import prisma from "../../../../../prisma";
import createServerRoute from "../../../../../utils/route";

const casesPerPage = 50;

const serverUrlsRoute = createServerRoute({
    async GET(req, res, _session, server, _member) {
        return fetchUrls(req, res, server);
    },
    async DELETE(req, res, _session, server, _member) {
        const { urlIds } = req.body;

        // Check query
        if (!Array.isArray(urlIds) || urlIds.some((x) => typeof x !== "number"))
            return res.status(400).json({ error: true, message: "URL IDs must be a number array" });

        // Just delete all of them
        await prisma.urlFilter
            .deleteMany({
                where: {
                    serverId: server.serverId,
                    id: {
                        in: urlIds,
                    },
                },
            });

        // To update the state
        return fetchUrls(req, res, server);
    },
});

async function fetchUrls(req: NextApiRequest, res: NextApiResponse, server: Server) {
    const { page: pageStr, search } = req.query;

    // Check query
    if (typeof pageStr !== "string")
        return res.status(400).json({ error: true, message: "Expected page single query" });

    const page = parseInt(pageStr, 10);

    if (typeof page !== "number" || page < 0)
        return res.status(400).json({ error: true, message: "Expected page to be a number that is at least 0." });
    else if (typeof search !== "undefined" && typeof search !== "string")
        return res.status(400).json({ error: true, message: "Expected search query to be a string." });

    const urls: UrlFilter[] = await prisma.urlFilter
        .findMany({
            where: {
                serverId: server.serverId,
            }
        });
    const foundUrls = search ? urls.filter((x) => x.subdomain?.includes(search) || x.domain.includes(search) || x.route?.includes(search)) : urls;

    const startIndex = page * casesPerPage;
    const endIndex = (page + 1) * casesPerPage;

    return res.status(200).json({
        // To get rid of useless information
        urls: foundUrls
            .slice(startIndex, endIndex),
        count: foundUrls.length
    });
}

export default serverUrlsRoute;