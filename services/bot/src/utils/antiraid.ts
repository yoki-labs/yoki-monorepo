import Captcha from "@haileybot/captcha-generator";
import type { S3 } from "aws-sdk";
import { nanoid } from "nanoid";

export const generateCaptcha = async (s3: S3, id?: string) => {
    const captcha = new Captcha();
    if (!id) id = nanoid();

    const uploadToBucket = await s3
        .upload({
            Bucket: process.env.S3_BUCKET,
            Key: `captcha/${id}`,
            Body: Buffer.from(captcha.dataURL.replace(/^data:image\/\w+;base64,/, ""), "base64"),
            ContentEncoding: "base64",
            ContentType: "image/jpeg",
            ACL: "public-read",
        })
        .promise();

    return { id, value: captcha.value.toString(), url: uploadToBucket.Location };
};
