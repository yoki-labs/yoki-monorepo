import { errorEmbed } from "@yokilabs/bot";
import { stripIndents } from "common-tags";

import YokiClient from "../Client";

export const errorLoggerS3 = async (ctx: YokiClient, event: string, err: Error, _context?: any) => {
    const errorContent = JSON.stringify(err);
    const safeStringifyCtx = ""; // context && stringify(context);
    const upload = await uploadS3(
        ctx,
        `error/${ctx.user!.name}/${event}-${Date.now()}.txt`,
        `Error: 
        ${errorContent}

        Ctx:
        ${safeStringifyCtx ?? "No ctx"}`
    );

    return ctx.errorHandler.send(`Error in ${event}`, [
        errorEmbed(`
        Error: 
        \`\`\`${err.message}\`\`\`

        Full log: [here](${upload.Location})
    `),
    ]);
};

export const uploadS3 = (client: YokiClient, key: string, content: string) => {
    return client.s3
        .upload({
            Bucket: process.env.S3_BUCKET,
            Key: key,
            Body: Buffer.from(stripIndents(content)),
            ContentType: "text/plain",
            ACL: "public-read",
        })
        .promise();
};
