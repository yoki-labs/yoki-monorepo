import { stripIndents } from "common-tags";

import YokiClient from "../Client";

export const eventErrorLoggerS3 = (ctx: YokiClient) => {
  return (event, content) => ctx.s3
    .upload({
      Bucket: process.env.S3_BUCKET,
      Key: `error/${ctx.user!.name}/${event}-${Date.now()}.txt`,
      Body: Buffer.from(stripIndents(content)),
      ContentType: "text/plain",
      ACL: "public-read",
    })
    .promise();
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