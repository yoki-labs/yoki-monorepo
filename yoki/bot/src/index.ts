// import { GEvent, setClientCommands } from "@yokilabs/bot";
import { config } from "dotenv";
import { Client, Embed } from "guilded.js";
// import { ClientEvents } from "guilded.js";
import { join } from "path";
import { stripIndents } from "common-tags";
// import recursive from "recursive-readdir";

// import YokiClient from "./Client";
// import unhandledPromiseRejection from "./events/other/unhandledPromiseRejection";
// import { errorLoggerS3 } from "./utils/s3";
// import { registerCanvasing } from "@yoki/common";
config({ path: join(__dirname, "..", "..", ".env") });

const client = new Client({
    "token": process.env.GUILDED_TOKEN,
});

client.on("ready", () => {
    console.log(`Logged in as ${client.user!.name}`);
});

client.on("messageCreated", async message => {
    if (!message.serverId) return;
    if (message.authorId === client.user!.id) return;

    const prefix = "?";

    if (!message.content.startsWith(prefix)) return;
    return message.reply(new Embed()
        .setTitle("Yoki has shutdown.")
        .setColor("red")
        .setDescription(stripIndents`
            Yoki will not be responding to any commands. Please refer to [this post](https://www.guilded.gg/Yoki/blog/News/Shutdown-Complete) for more information.

            Thank you all for being a part of this incredible journey.

            Sincerely,
            Nico, IDKGoodName, ItzNxthaniel, Codeize, Dylan, & Shay.
            **Yoki Labs**
        `)
    )
});

client.login();
// // Load env variables

// // Check ENV variables to ensure we have the necessary things to start the bot up
// ["DEFAULT_PREFIX", "GUILDED_TOKEN", "DATABASE_URL", "MAIN_SERVER", "ERROR_WEBHOOK", "S3_KEY_ID", "S3_SECRET_KEY", "S3_BUCKET"].forEach((x) => {
//     if (!process.env[x]) throw new Error(`Missing env var ${x}`);
// });

// const client = new YokiClient(
//     {
//         token: process.env.GUILDED_TOKEN,
//         rest: {
//             maxRatelimitRetryLimit: 10,
//         } as any,
//     },
//     process.env.DEFAULT_PREFIX!
// );
// client.ws.options.replayMissedEvents = false;

// // Under client.eventHandler, we register a bunch of events that we can execute
// // This makes it simple to add new events to our bot by just creating a file and adding it to that object.
// // And any unhandled objects are simply ignored thanks to optional chaining
// client.ws.emitter.on("gatewayEvent", async (event, data) => {
//     const { serverId } = data.d as { serverId?: string | null };
//     if (!serverId || ["XjBWymwR", "DlZMvw1R"].includes(serverId)) return;

//     if (!client.eventHandler[event]) return;
//     const serverFromDb = await client.dbUtil.getServer(serverId).catch((err) => unhandledPromiseRejection(err as Error, client));
//     if (!serverFromDb || serverFromDb?.blacklisted) return;
//     return client.eventHandler[event]?.(data, client, serverFromDb).catch((err) => errorLoggerS3(client, event, err, { server: serverId, event }));
// });

// client.ws.emitter.on("error", (err, errInfo, data) => {
//     console.log(`[WS ERR]: ${err}\n  ${errInfo?.message}\n  [WS ERR STACK]:${errInfo?.stack}`);
// });

// client.ws.emitter.on("exit", (reason) => {
//     console.log(reason);
//     // console.log("Restarting...");
//     // process.exit(1);
// });
client.rest.emitter.on("error", (req, res) => console.log(`[REST:ERR]: req - ${JSON.stringify(req)}\nRes - ${JSON.stringify(res)}`));
client.rest.emitter.on("ratelimit", (data) => console.log(`[RATELIMIT]: ${JSON.stringify(data)}`));

// // This is for any custom events that we emit
// client.emitter.on("ActionIssued", client.customEventHandler.ActionIssued);

// // This handler is simply just to log errors to our Guilded channel.
process.on("unhandledRejection", (err) => {
    console.log(err);
});

// void (async (): Promise<void> => {
//     registerCanvasing();

//     // Load all filse & directories in the commands dir recursively
//     await setClientCommands(client, join(__dirname, "commands"));
//     // Load guilded events
//     const eventFiles = await recursive(join(__dirname, "events", "guilded"));

//     for (const eventFile of eventFiles.filter((x) => !x.endsWith(".ignore.js") && !x.endsWith(".map"))) {
//         const event = (await import(eventFile)).default as GEvent<YokiClient, any>;
//         if (!event.name) {
//             console.log(`ERROR loading event ${eventFile}`);
//             continue;
//         }
//         console.log(`Loading event ${event.name}`);
//         client.on(event.name, async (...args: Parameters<ClientEvents[keyof ClientEvents]>) => {
//             try {
//                 // @ts-ignore this is valid
//                 if (["XjBWymwR", "DlZMvw1R"].includes(args[0]?.serverId)) return;
//                 await event.execute([...args, client]);
//             } catch (err) {
//                 await errorLoggerS3(client, event.name, err as Error, args);
//             }
//         });
//     }
//     try {
//         // check if the main server exists and is in the database, this check is mostly to make sure our prisma migrations are applied
//         const existingMainServer = await client.prisma.server.findMany({ where: { serverId: process.env.MAIN_SERVER } });
//         if (!existingMainServer.length) await client.dbUtil.createFreshServerInDatabase(process.env.MAIN_SERVER, { flags: ["EARLY_ACCESS"] });
//     } catch (e) {
//         console.log(e);
//         console.log("ERROR!: You have not applied the migrations. You must run 'pnpm migrate:dev'. Exiting...");
//         await client.errorHandler
//             .send(
//                 "URGENT! The prisma schema is OUT OF SYNC with the database. The bot WILL NOT start up until you fix this!! Run `pnpm migrate:dev` and commit the generation migrations ASAP."
//             )
//             .catch(() => null);
//         return process.exit(1);
//     }

//     try {
//         // connect ws connection
//         await client.init();
//     } catch (e) {
//         console.error(e);
//         return process.exit(1);
//     }
// })();
