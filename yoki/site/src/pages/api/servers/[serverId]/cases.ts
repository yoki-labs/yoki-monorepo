import { Action } from "@prisma/client";
import prisma from "../../../../prisma";
import createServerRoute from "../../../../utils/route";

const casesPerPage = 50;

const serverCasesRoute = createServerRoute({
    async GET(_req, res, _session, server, _member) {
        const { page: pageStr } = _req.query;

        // Check query
        if (typeof pageStr !== "string")
            return res.status(400).json({ error: true, message: "Expected page single query" });

        const page = parseInt(pageStr);

        if (typeof page !== "number" || page < 0)
            return res.status(400).json({ error: true, message: "Expected page to be a number that is at least 0." });

        const cases: Action[] = await prisma.action
            .findMany({
                where: {
                    serverId: server.serverId,
                }
            });

        const startIndex = page * casesPerPage;
        const endIndex = (page + 1) * casesPerPage;

        return res.status(200).json({
            // To get rid of useless information
            cases: cases
                .slice(startIndex, endIndex)
                .map(({ logChannelId, logChannelMessage, ...rest }) => rest),
            count: cases.length
        });
    }
});

export default serverCasesRoute;