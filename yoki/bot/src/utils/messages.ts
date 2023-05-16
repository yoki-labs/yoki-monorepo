import type { ChannelType } from "@guildedjs/guilded-api-typings";
import { codeBlock } from "@yokilabs/bot";
import { stripIndents } from "common-tags";

import type Client from "../Client";

export const quoteChangedContent = (ctx: Client, serverId: string, contentId: string | number, contentType: ChannelType, content?: string): string | Promise<string> =>
    content
        ? content.length > 1014
            ? createContentQuoteBucket(ctx, serverId, contentId, contentType, content)
            : codeBlock(content, "md")
        : `_Content contains embeds and no text content._`;

function createContentQuoteBucket(ctx: Client, serverId: string, contentId: string | number, type: ChannelType, content: string) {
    return ctx.s3
        .upload({
            Bucket: process.env.S3_BUCKET,
            Key: `logs/${type}-delete-${serverId}-${contentId}.txt`,
            Body: Buffer.from(stripIndents`
                Content: ${content}
                ------------------------------------
            `),
            ContentType: "text/plain",
            ACL: "public-read",
        })
        .promise()
        .then((uploadToBucket) => `This log is too big to display in Guilded. You can find the full log [here](${uploadToBucket.Location})`);
}
