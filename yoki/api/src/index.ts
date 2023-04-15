import "reflect-metadata";

import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";
import { join, resolve } from "path";
import { buildSchema } from "type-graphql";

import { resolvers } from "./generated/type-graphql";

// Load env variables
config({ path: join(__dirname, "..", "..", "..", ".env") });
const PORT = process.env.PORT ? Number(process.env.PORT) : 2222;

async function bootstrap() {
    console.log("Building schema...");
    const schema = await buildSchema({
        resolvers,
        emitSchemaFile: resolve(__dirname, "./generated-schema.graphql"),
        validate: false,
    });

    console.log("Connecting to DB");
    const prisma = new PrismaClient();
    await prisma.$connect();

    const server = new ApolloServer({
        schema,
    });

    console.log("Starting server.");
    // Start the server
    const { url } = await startStandaloneServer(server, {
        // eslint-disable-next-line @typescript-eslint/require-await
        context: async () => ({
            prisma,
        }),
        listen: { port: PORT },
    });
    console.log(`Server is running, GraphQL Playground available at ${url}`);
}

void bootstrap().catch(console.log);
