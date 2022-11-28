import type { WebhookClient } from "@guildedjs/webhook-client";

import { errorEmbed } from "../utils/formatters";

let errorCounter = 0;
let resetCounter: NodeJS.Timer | null = null;

export default (err: Error, errorHandler: WebhookClient) => {
    console.error(err);

    // This will prevent us from spamming webhook requests on repeat failures in order to respect Guilded API
    errorCounter++;
    if (!resetCounter)
        resetCounter = setTimeout(() => {
            errorCounter = 0;
            resetCounter = null;
        }, 600000);

    // send error to guilded channel
    if (errorCounter <= 15) void errorHandler.send(`Unhandled error! Current burst ${errorCounter}/${15}`, [errorEmbed(err)]);
};
