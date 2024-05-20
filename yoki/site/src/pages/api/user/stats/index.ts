import { Severity } from "@prisma/client";

import prisma from "../../../../prisma";
import { createUserRoute } from "../../../../utils/routes/users";

const userAppealsRoute = createUserRoute({
    async GET(_req, res, _session, user) {
        const userId = user.id!;

        const [appeals, caseCount] = await prisma.$transaction([
            prisma.appeal.findMany({
                where: {
                    creatorId: userId,
                },
            }),
            prisma.action.count({
                where: {
                    targetId: userId,
                    // Notes are supposed to be secret
                    type: {
                        not: Severity.NOTE,
                    },
                },
            }),
        ]);
        const awaitingAppeals = appeals.filter((x) => !x.status);

        return res.status(200).json({ cases: caseCount, appeals: appeals.length, awaitingAppeals: awaitingAppeals.length });
    },
});

export default userAppealsRoute;
