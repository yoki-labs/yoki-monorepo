import "dotenv/config";
["DEFAULT_PREFIX", "GUILDED_TOKEN", "DATABASE_URL"].forEach((x) => {
    if (!process.env[x]) throw new Error(`Missing env var ${x}`);
});

import WebSocketManager from "@guildedjs/ws";
import REST from "@guildedjs/rest";
import ChatMessageCreated from "./events/ChatMessageCreated";
import { readdir } from "fs/promises";
import type { Command } from "./commands/Command.spec";
import { join } from "path";
import { Context } from "typings";
import Collection from "@discordjs/collection";

const ws = new WebSocketManager({ token: process.env.GUILDED_TOKEN });
const rest = new REST({ token: process.env.GUILDED_TOKEN });
const commands = new Collection<string, Command>();
const eventHandler: { [x: string]: (packet: any, ctx: Context) => void } = {
    ChatMessageCreated,
};

ws.emitter.on("gatewayEvent", (event, data) => eventHandler[event]?.(data, { rest, commands }));
ws.emitter.on("ready", () => console.log("WS is ready to receive events!"));

void (async () => {
    const commandFiles = (await readdir(join(__dirname, "commands"))).filter((file) => file.endsWith(".command.js"));
    for (const commandFile of commandFiles) {
        const command = (await import(join(__dirname, "commands", commandFile))).default as Command;
        commands.set(command.name.toLowerCase(), command);
    }
    ws.connect();
})();
