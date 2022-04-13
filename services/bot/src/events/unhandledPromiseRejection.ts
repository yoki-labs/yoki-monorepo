import Embed from "@guildedjs/embeds";
import type { WebhookClient } from "@guildedjs/webhook-client";
import { stripIndents } from "common-tags";

export default (err: Error, errorHandler: WebhookClient) => {
    console.error(err);
    Error.captureStackTrace(err);
    void errorHandler.send("Unhandled error!", [
        new Embed()
            .setDescription(
                stripIndents`
				${err.stack}
			`
            )
            .setColor("RED"),
    ]);
};
