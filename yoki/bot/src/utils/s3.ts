import { errorEmbed } from "@yokilabs/bot";
import { stripIndents } from "common-tags";
import stringify from "json-stringify-safe";

import YokiClient from "../Client";

export const errorLoggerS3 = async (ctx: YokiClient, event: string, err: Error, context?: any) => {
    const errorContent = JSON.stringify(err);
    const safeStringifyCtx = context && stringify(context);

    const upload = await ctx.s3
        .upload({
            Bucket: process.env.S3_BUCKET,
            Key: `error/${ctx.user!.name}/${event}-${Date.now()}.txt`,
            Body: Buffer.from(
                stripIndents(`Error: 
            ${errorContent}

            Ctx:
            ${safeStringifyCtx ?? "No ctx"}`)
            ),
            ContentType: "text/plain",
            ACL: "public-read",
        })
        .promise();

    return ctx.errorHandler.send(`Error in ${event}`, [
        errorEmbed(`
        Error: 
        \`\`\`
        ${err.message}
        \`\`\`

        Full stack & context: ${upload.Location}
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
