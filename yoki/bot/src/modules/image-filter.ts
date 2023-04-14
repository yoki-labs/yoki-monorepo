import { Util } from "@yokilabs/bot";
import fetch from "node-fetch";

import type YokiClient from "../Client";

// import { Util } from "../helpers/util";

interface ImageScanResult {
    hentai: number;
    porn: number;
    drawing: number;
    sexy: number;
    neutral: number;
}

export class ImageFilterUtil extends Util<YokiClient> {
    readonly hostURL = process.env.IMAGE_SCANNER_URL ?? "http://nsfw:4433/nsfw";

    public async scanImage(imageURL: string) {
        const req: ImageScanResult = await fetch(this.hostURL, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ imageURL }) })
            .then((x) => x.json() as Promise<ImageScanResult>)
            .catch((e) => {
                console.log(e);
                return { hentai: 0, porn: 0, drawing: 0, sexy: 0, neutral: 0 };
            });

        return req.hentai >= 0.5 || req.porn >= 0.65;
    }
}
