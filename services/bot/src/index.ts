import "dotenv/config";
["MAIN_PREFIX", "TOKEN"].forEach(x => {
    if(!process.env[x]) throw new Error(`Missing env var ${x}`);
});

import WebSocketManager from "@guildedjs/ws";
import REST from "@guildedjs/rest";
import ChatMessageCreated from "./events/ChatMessageCreated";

const ws = new WebSocketManager({ token: process.env.TOKEN });
const rest = new REST({ token: process.env.TOKEN! });
const eventHandler: { [x: string]: Function } = {
    "ChatMessageCreated": ChatMessageCreated
}

ws.emitter.on("gatewayEvent", (event, data) => eventHandler[event]?.(data, { rest }));
ws.emitter.on("ready", () => console.log("WS is ready to receive events!"));

ws.connect();





