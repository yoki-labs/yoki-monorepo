import { PrismaClient } from "@prisma/client";

if (process.env.VERCEL_ENV !== "preview" && process.env.CI !== "true" && !process.env.DATABASE_URL) throw new Error("Missing database URL.");
const prisma = new PrismaClient();
export default prisma;