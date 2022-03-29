import { PrismaClient } from "@prisma/client";

export const getServerFromDatabase = (prisma: PrismaClient, serverId: string) => prisma.server.findUnique({ where: { serverId } });
export const createFreshServerInDatabase = (prisma: PrismaClient, serverId: string) =>
    prisma.server.create({
        data: {
            serverId,
            locale: "en-US",
            premium: false,
            disabled: false,
            muteRoleId: null,
            botJoinedAt: null,
            filterEnabled: false,
        },
    });
