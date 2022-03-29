import { config } from "dotenv";
import { join } from "path";
config({ path: join(__dirname, "..", "..", "..", ".env") });

["DEFAULT_PREFIX", "GUILDED_TOKEN", "DATABASE_URL"].forEach((x) => {
    if (!process.env[x]) throw new Error(`Missing env var ${x}`);
});

import Collection from "@discordjs/collection";
import REST from "@guildedjs/rest";
import WebSocketManager from "@guildedjs/ws";
import { PrismaClient } from "@prisma/client";
import recursive from "recursive-readdir";

import type { Command } from "./commands/Command.spec";
import ChatMessageCreated from "./events/ChatMessageCreated";
import { Context } from "./typings";

const ws = new WebSocketManager({ token: process.env.GUILDED_TOKEN });
const rest = new REST({ token: process.env.GUILDED_TOKEN });
const commands = new Collection<string, Command>();
const prisma = new PrismaClient();
const eventHandler: { [x: string]: (packet: any, ctx: Context) => void } = {
    ChatMessageCreated,
};

ws.emitter.on("gatewayEvent", (event, data) => eventHandler[event]?.(data, { rest, commands, prisma }));
ws.emitter.on("ready", () => console.log("WS is ready to receive events!"));

void (async () => {
    const commandFiles = await recursive(join(__dirname, "commands"));
    for (const commandFile of commandFiles.filter((x) => x.endsWith(".command.js"))) {
        const command = (await import(commandFile)).default as Command;
        console.log(`Loading command ${command.name}`);
        commands.set(command.name.toLowerCase(), command);
    }
    ws.connect();
})();
