import { Action } from "@prisma/client";
import prisma from "../../../../../prisma";
import createServerRoute from "../../../../../utils/route";

const serverCasesSingleRoute = createServerRoute({
    async DELETE(req, res, _session, server, _member) {
        const { caseId } = req.query;

        // Check query
        if (typeof caseId !== "string")
            return res.status(400).json({ error: true, message: "Case ID must be a string" });

        const cases: Action[] = await prisma.action
            .findMany({
                where: {
                    serverId: server.serverId,
                }
            });

        const existingCase = cases.find((x) => x.id === caseId);

        // Can't delete non-existant case
        if (!existingCase)
            return res.status(404).json({ error: true, message: "Case by this ID does not exist." });

        await prisma.action.deleteMany({
            where: {
                serverId: server.serverId,
                id: existingCase.id,
            },
        });

        return res.status(204);
    },
});

export default serverCasesSingleRoute;