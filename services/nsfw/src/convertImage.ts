import * as tf from "@tensorflow/tfjs-node";
import sharp from "sharp";

export const convert = async (image: Buffer) => {
    const decodedImage = await sharp(image).toFormat("png").toBuffer();
    return tf.node.decodeImage(decodedImage, 3);
};
