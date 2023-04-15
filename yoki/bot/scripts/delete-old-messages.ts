import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";
import { join } from "path";

if (process.env.CI !== "true") config({ path: join(__dirname, "..", "..", "..", ".env.prod") });
const prisma = new PrismaClient();

void (async () => {
    console.log("Running old message removal...");
    const runDate = new Date();
    const removalDates = new Date(runDate.setDate(runDate.getDate() - (process.env.CI ? 7 : 14)));
    try {
        const messagesRemoved = await prisma.message.deleteMany({
            where: {
                createdAt: {
                    lt: removalDates,
                },
            },
        });
        const topicsRemoved = await prisma.forumTopic.deleteMany({
            where: {
                createdAt: {
                    lt: removalDates,
                },
            },
        });
        console.log(`Successfully removed ${messagesRemoved.count} messages and ${topicsRemoved.count} forum topics`);
    } catch (e: any) {
        console.log("There was an issue performing the removal.");
        console.error(e);
    }
    console.log("Database cleanup completed.");
})();
