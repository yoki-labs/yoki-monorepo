import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";
import { join } from "path";

config({ path: join(__dirname, "..", "..", "..", ".env.prod") });
console.log(process.env.DATABASE_URL);
const prisma = new PrismaClient();

void (async () => {
    console.log("Running old message removal...");
    const runDate = new Date();
    const removalDates = new Date(runDate.setDate(runDate.getDate() - 14));
    try {
        const removalCount = await prisma.message.deleteMany({
            where: {
                createdAt: {
                    lt: removalDates,
                },
            },
        });
        console.log(`Successfully removed ${removalCount.count} messages`);
    } catch (e: any) {
        console.log("There was an issue performing the removal.");
        console.error(e);
    }
    console.log("Database cleanup completed.");
})();
