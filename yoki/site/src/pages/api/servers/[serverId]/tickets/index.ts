import { ModmailThread } from "@prisma/client";

import { createServerDataRoute } from "../../../../../utils/routes/servers";
import prisma from "../../../../../prisma";
import { clientRest } from "../../../../../guilded";

const serverTicketsRoute = createServerDataRoute<ModmailThread, string>({
    type: "string",
    searchFilter(value, search) {
        return value.handlingModerators.some((x) => x.includes(search));
    },
    fetchMany(serverId) {
        return prisma.modmailThread.findMany({
            orderBy: [{ closed: "asc" }, { createdAt: "desc" }],
            where: {
                serverId,
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
            })
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
