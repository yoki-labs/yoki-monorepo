import { codeBlock, errorEmbed } from "@yokilabs/bot";
import { stripIndents } from "common-tags";

import type YokiClient from "../../Client";
import { errorLoggerS3, uploadS3 } from "../../utils/s3";

let errorCounter = 0;
setInterval(() => (errorCounter = 0), 600000);

export default async (err: Error, client: YokiClient) => {
    console.error(err);

    // This will prevent us from spamming webhook requests on repeat failures in order to respect Guilded API
    errorCounter++;

    // send error to guilded channel
    if (errorCounter >= 15) return;

    const errorContent = JSON.stringify(err);
    if (errorContent.length) {
        const uploaded = await uploadS3(client, `error/${client.user!.name}/unhandled-${Date.now()}.txt`, errorContent);
        void client.errorHandler.send(`Unhandled error! Current burst ${errorCounter}/${15}`, [
            errorEmbed(stripIndents`
            ${codeBlock((err as Error).message)}
            This error was too long to send to Guilded. [View on S3](${uploaded.Location})
        `),
        ]);
        return;
    }

    void errorLoggerS3(client, "UNHANDLED", err, { errorCounter: `Unhandled error! Current burst ${errorCounter} / ${15}` });
};
