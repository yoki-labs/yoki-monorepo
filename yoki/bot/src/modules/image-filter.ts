import { Colors } from "@yokilabs/utils";
import fetch from "node-fetch";

import { Server, Severity } from "../typings";
import { IMAGE_REGEX } from "../utils/matching";
import BaseFilterUtil from "./base-filter";
import { FilteredContent } from "./content-filter";

interface ImageScanResult {
    hentai: number;
    porn: number;
    drawing: number;
    sexy: number;
    neutral: number;
}

export class ImageFilterUtil extends BaseFilterUtil {
    readonly hostURL = process.env.IMAGE_SCANNER_URL ?? "http://localhost:4433/nsfw";

    readonly defaultPornConfidence: number = 0.65;
    readonly defaultHentaiConfidence: number = 0.5;

    async scanMessageMedia(server: Server, channelId: string, content: string, userId: string, onDelete: () => Promise<unknown>): Promise<boolean> {
        const matches = [...content.matchAll(IMAGE_REGEX)];

        if (!matches.length) return false;

        void this.client.amp.logEvent({
            event_type: "MESSAGE_MEDIA_ACTION",
            user_id: userId,
            event_properties: { serverId: server.serverId },
        });

        const nsfwDetected = await Promise.any(
            matches.map(async ([_, url]) =>
                this.scanImage(url, server.nsfwHentaiConfidence, server.nsfwPornConfidence).then((nsfw) => {
                    // Fail and ignore in `Promise.any`, let others continue do their job
                    if (!nsfw) throw nsfw;
                })
            )
        )
            .then(() => true)
            .catch(() => false);

        if (nsfwDetected) {
            try {
                // Warn/mute/kick/ban
                await this.dealWithUser(userId, server, channelId, FilteredContent.Message, onDelete, `NSFW image filter tripped`, server.spamInfractionPoints, Severity.WARN);
            } catch (e) {}
        }

        return nsfwDetected;
    }

    public async scanImage(imageURL: string, serverHentaiConfidence: number | null, serverPornConfidence: number | null) {
        const req: ImageScanResult = await fetch(this.hostURL, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ imageURL }) })
            .then((x) => x.json() as Promise<ImageScanResult>)
            .catch((e) => {
                console.log(e);
                return { hentai: 0, porn: 0, drawing: 0, sexy: 0, neutral: 0 };
            });
        console.log("Image req", req);

        return req.hentai >= (serverHentaiConfidence ?? this.defaultHentaiConfidence) || req.porn >= (serverPornConfidence ?? this.defaultPornConfidence);
    }

    override onUserWarn(userId: string, _serv: Server, channelId: string | null) {
        // When channels and messages get filtered
        return this.client.messageUtil.sendWarningBlock(
            channelId!,
            `Inappropriate image`,
            `<@${userId}>, it seems that one of your images may be inappropriate. This is a warning for you to not use it again, otherwise moderation actions may be taken against you.`,
            undefined,
            { isPrivate: true }
        );
    }

    override onUserMute(userId: string, _serv: Server, channelId: string | null) {
        return this.client.messageUtil.sendEmbed(
            channelId!,
            {
                title: `:mute: You have been muted`,
                description: `<@${userId}>, you have been muted for posting multiple images that may be inappropriate. Please reach out to staff if this was in error.`,
                color: Colors.red,
            },
            {
                isPrivate: true,
            }
        );
    }
}
