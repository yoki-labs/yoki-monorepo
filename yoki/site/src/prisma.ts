import { PrismaClient, Server } from "@prisma/client";

import { SanitizedServer } from "./lib/@types/db";

export function sanitizeServer({ id: _i, flags, blacklisted: _b, botJoinedAt: _j, createdAt: _c, updatedAt: _u, ...rest }: Server): SanitizedServer {
    return { ...rest, earlyaccess: flags.includes("EARLY_ACCESS") };
}

const prismaClientSingleton = () => new PrismaClient();

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
