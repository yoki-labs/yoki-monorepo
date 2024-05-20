import { WebSocketManager, WebSocketOptions } from "guilded.js";
import WebSocket from "ws";

export default class CustomWsManager extends WebSocketManager {
    constructor(wsOptions: WebSocketOptions) {
        super(wsOptions);
    }

    connect(): void {
        this._debug(`Connecting to Guilded WS Gateway at url ${this.wsURL}.`);
        const headers = {
            Authorization: `Bearer ${this.token}`,
            "x-guilded-bot-api-use-official-markdown": "true",
        };

        if (this.shouldRequestMissedEvents && this.lastMessageId) headers["guilded-last-message-id"] = this.lastMessageId;

        try {
            this.socket = new WebSocket(this.wsURL, {
                headers,
            });
            this._debug("Socket created");
        } catch (error) {
            this._debug(`Error creating socket ${(error as Error).message}.`);

            if (!this.shouldRequestMissedEvents && this.lastMessageId) throw error;

            this.lastMessageId = null;
            if (error instanceof Error) this.emitter.emit("error", "Error connecting to socket", error);

            this._handleDisconnect({
                blockReconnects: true,
            });
            return;
        }

        this.socket?.on("open", this["onSocketOpen"].bind(this));
        this.socket?.on("ping", this["onSocketPing"].bind(this));
        this.socket?.on("pong", this["onSocketPong"].bind(this));
        this.socket?.on("message", (data) => {
            this.emitter.emit("raw", data);
            this["onSocketMessage"](data.toString());
        });
        this.socket.on("error", (err) => {
            this._debug(`Error received from WS. ${err.message}`);
            this.emitter.emit("exit", "Gateway connection  closed due to error.");
            this._handleDisconnect({
                blockReconnects: true,
            });
        });

        this.socket.on("close", (_code, _reason) => {
            this.emitter.emit("exit", "Gateway connection closed.");
            this._handleDisconnect({
                blockReconnects: false,
            });
        });
    }
}
