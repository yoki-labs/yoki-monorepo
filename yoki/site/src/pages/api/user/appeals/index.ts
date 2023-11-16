import { Appeal } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

import prisma from "../../../../prisma";
import { createUserRoute } from "../../../../utils/routes/route";

const appealsPerPage = 50;

const userAppealsRoute = createUserRoute({
    async GET(req, res, _session, user) {
        return fetchAppeals(req, res, user.id!);
    },
    async DELETE(req, res, _session, user) {
        const { appealIds } = req.body;

        // Check query
        if (!Array.isArray(appealIds) || appealIds.some((x) => typeof x !== "number")) return res.status(400).json({ error: true, message: "appealIds must be a number array" });

        // Just delete all of them
        await prisma.appeal.deleteMany({
            where: {
                creatorId: user.id,
                id: {
                    in: appealIds,
                },
            },
        });

        // To update the state
        return fetchAppeals(req, res, user.id);
    },
});

async function fetchAppeals(req: NextApiRequest, res: NextApiResponse, userId: string) {
    const { page: pageStr, search } = req.query;

    // Check query
    if (typeof pageStr !== "string") return res.status(400).json({ error: true, message: "Expected page single query" });

    const page = parseInt(pageStr, 10);

    if (typeof page !== "number" || page < 0) return res.status(400).json({ error: true, message: "Expected page to be a number that is at least 0." });
    else if (typeof search !== "undefined" && typeof search !== "string") return res.status(400).json({ error: true, message: "Expected search query to be a string." });

    const appeals: Appeal[] = await prisma.appeal.findMany({
        where: {
            creatorId: userId,
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

export default userAppealsRoute;
