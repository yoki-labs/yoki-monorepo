import { PrismaClient, Server } from "@prisma/client";
import { SanitizedServer } from "./lib/@types/db";

if (process.env.VERCEL_ENV !== "preview" && process.env.CI !== "true" && !process.env.DATABASE_URL) throw new Error("Missing database URL.");
const prisma = new PrismaClient();
export default prisma;

export function sanitizeServer({
    id,
    flags,
    blacklisted,
    botJoinedAt,
    createdAt,
    updatedAt,
    ...rest
}: Server): SanitizedServer {
    return rest;
}