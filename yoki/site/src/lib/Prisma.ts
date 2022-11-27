import { PrismaClient } from "@prisma/client";

if (process.env.NODE_ENV !== "development" && !process.env.DATABASE_URL) throw new Error("Missing database URL.");
const prisma = new PrismaClient();
export default prisma;