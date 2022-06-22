import * as tf from "@tensorflow/tfjs-node";
import decode from "image-decode";

export const convert = (image: Buffer) => {
    const parsedImage = decode(image);
    const numChannels = 3;
    const numPixels = parsedImage.width * parsedImage.height;
    const values = new Int32Array(numPixels * numChannels);

    for (let i = 0; i < numPixels; i++) for (let c = 0; c < numChannels; ++c) values[i * numChannels + c] = parsedImage.data[i * 4 + c];
    return tf.tensor3d(values, [parsedImage.height, parsedImage.width, numChannels], "int32");
};
