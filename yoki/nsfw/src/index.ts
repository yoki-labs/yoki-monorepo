import { config } from "dotenv";
import express from "express";
import { inspect } from "node:util";
import fetch from "node-fetch";
import * as nsfwJS from "nsfwjs";
import { join } from "path";

import { convert } from "./convertImage";
import { validateOptions } from "./util";

config({ path: join(__dirname, "..", "..", "..", ".env") });

["TOKEN_SECRET"].forEach((x) => {
    if (!process.env[x]) throw new Error(`Missing env var ${x}`);
});

const app = express();
app.use(express.json());
let _model: nsfwJS.NSFWJS;
// empty comment
app.post("/nsfw", validateOptions<{ imageURL: string }>([["imageURL", "string", false]]), async (req, res) => {
    const { imageURL } = req.body;
    if (!imageURL) res.status(400).json({ error: { message: "You must provide an image URL to lookup." } });
    console.log(`Scanning image ${imageURL}`);
    const image = await (await fetch(imageURL)).buffer();
    const parsedImage = await convert(image);
    const predictions = await _model.classify(parsedImage);
    parsedImage.dispose();

    const response: Record<string, number> = {};
    for (const prediction of predictions) {
        response[prediction.className.toLowerCase()] = prediction.probability;
    }
    console.log(`total predictions ${inspect(response)}`);
    return res.json(response);
});

const load_model = async () => {
    _model = await nsfwJS.load();
};

// Keep the model in memory, make sure it's loaded only once
void load_model().then(() => app.listen(4433));
