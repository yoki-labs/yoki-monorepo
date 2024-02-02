import { MessageUtil } from "@yokilabs/bot";
import { TestClient } from "../Client";
import { Command, Server } from "../typings";
import { Message, MessageContent } from "guilded.js";

export default class DerivedMessageUtil extends MessageUtil<TestClient, Server, Command> {
    sendMarkdown(channelId: string, message: MessageContent) {
        return this.client.rest.make({
            path: `/channels/${channelId}/messages`,
            method: "POST",
            body: message,
            headers: {
                "x-guilded-bot-api-use-official-markdown": "true",
            },
        });
    }

    replyWithMarkdown(message: Message, content: MessageContent) {
        const msgContent: MessageContent = typeof content === "string" ? { replyMessageIds: [message.id], content } : { replyMessageIds: [message.id], ...content };

        return this.sendMarkdown(message.channelId, msgContent);
    }
}