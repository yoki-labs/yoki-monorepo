import Embed from "@guildedjs/embeds";
import type { WebhookClient } from "@guildedjs/webhook-client";
import { stripIndents } from "common-tags";

export default (err: Error, errorHandler: WebhookClient) => {
    console.error(err);
    // send error to guilded channel
    void errorHandler.send("Unhandled error!", [new Embed().setDescription(stripIndents`\n${err.stack ?? err.message}`).setColor("RED")]);
};
