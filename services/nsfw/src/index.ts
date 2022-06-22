import { config } from "dotenv";
import { join } from "path";
config({ path: join(__dirname, "..", "..", "..", ".env") });

["TOKEN_SECRET"].forEach((x) => {
    if (!process.env[x]) throw new Error(`Missing env var ${x}`);
});

import express from "express";
import fetch from "node-fetch";
import * as nsfwJS from "nsfwjs";

import { convert } from "./convertImage";
import { validateOptions } from "./util";

const app = express();
app.use(express.json());
let _model: nsfwJS.NSFWJS;

app.post("/nsfw", validateOptions<{ imageURL: string }>([["imageURL", "string", false]]), async (req, res) => {
    if (!req.body.imageURL) res.status(400).json({ error: { message: "You must provide an image URL to lookup." } });
    const image = await (await fetch(req.body.imageURL)).buffer();
    const parsedImage = await convert(image);
    const predictions = await _model.classify(parsedImage);
    parsedImage.dispose();

    const response: Record<string, number> = {};
    for (const prediction of predictions) {
        response[prediction.className.toLowerCase()] = prediction.probability;
    }
    return res.json(response);
});

const load_model = async () => {
    _model = await nsfwJS.load();
};

// Keep the model in memory, make sure it's loaded only once
void load_model().then(() => app.listen(4443));
