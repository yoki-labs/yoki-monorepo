import { errorEmbed } from "@yokilabs/util";

import type YokiClient from "../../Client";

let errorCounter = 0;
let resetCounter: NodeJS.Timer | null = null;

export default (err: Error, client: YokiClient) => {
    console.error(err);

    // This will prevent us from spamming webhook requests on repeat failures in order to respect Guilded API
    errorCounter++;
    if (!resetCounter)
        resetCounter = setTimeout(() => {
            errorCounter = 0;
            resetCounter = null;
        }, 600000);

    // send error to guilded channel
    if (errorCounter <= 15) void client.errorHandler.send(`Unhandled error! Current burst ${errorCounter}/${15}`, [errorEmbed(err)]);
};
