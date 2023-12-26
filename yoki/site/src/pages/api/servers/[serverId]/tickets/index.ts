import { ModmailThread } from "@prisma/client";

import { clientRest } from "../../../../../guilded";
import prisma from "../../../../../prisma";
import { createServerDataRoute } from "../../../../../utils/routes/servers";
import { isHashId } from "@yokilabs/utils";
import { queryUserIsIncorrect } from "../../../../../utils/routes/body";

const availableCloseStatus = ["true", "false"];

const serverTicketsRoute = createServerDataRoute<ModmailThread, string>({
    type: "string",
    searchFilter(value, search) {
        return value.handlingModerators.some((x) => x.includes(search));
    },
    async fetchMany(serverId, query) {
        // Invalid close state filter
        if (query.closed && (typeof query.closed !== "string" || !availableCloseStatus.includes(query.closed as string)))
            return null;
        else if (queryUserIsIncorrect(query.user))
            return null;

        const closed = typeof query.closed === "string" ? query.closed !== "false" : undefined;
        const user = (query.user || undefined) as string | undefined;

        return prisma.modmailThread.findMany({
            orderBy: [{ closed: "asc" }, { createdAt: "desc" }],
            where: {
                serverId,
                closed,
                openerId: user,
            },
        });
    },
    async deleteMany(serverId, ids) {
        // Since modmail message contains no serverId column
        // This is to prevent deleting modmail messages from different servers
        const possibleModmailMessageDeletions = await prisma.modmailThread.findMany({
            where: {
                serverId,
                id: {
                    in: ids,
                },
            },
        });

        return Promise.all([
            prisma.modmailMessage.deleteMany({
                where: {
                    modmailThreadId: {
                        in: possibleModmailMessageDeletions.map((x) => x.id),
                    },
                },
            }),
            prisma.modmailThread.deleteMany({
                where: {
                    serverId,
                    id: {
                        in: ids,
                    },
                },
            }),
        ]);
    },
    async fetchUsers(serverId, tickets) {
        const userIds = Array.from(new Set([...tickets.map((x) => x.openerId), ...tickets.flatMap((x) => x.handlingModerators)]));

        return clientRest.post(`/teams/${serverId}/members/detail`, {
            idsForBasicInfo: userIds,
            userIds: [],
        });
    },
});

export default serverTicketsRoute;
