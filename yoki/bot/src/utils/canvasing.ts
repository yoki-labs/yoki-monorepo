import { createCanvas, loadImage } from "canvas";
import { writeFileSync } from "fs";
import { join } from "path";
import fetch from "node-fetch";
import sharp from "sharp";
import { Member } from "guilded.js";

export async function generateUserJoinBanner(member: Member): Promise<Buffer> {
    // Context
    const canvas = createCanvas(600, 250)
    const canvasCtx = canvas.getContext("2d");

    // Text
    canvasCtx.fillStyle = "#07050F";
    canvasCtx.fillRect(0, 0, 600, 250);
    canvasCtx.font = "bold 32px 'Fira Sans'";
    canvasCtx.textAlign = "center";
    canvasCtx.fillStyle = "#FFFFFF";
    canvasCtx.fillText(`Welcome @${member.username} to the server!`, 300, 215, 300);

    // Avatar
    const avatarRequest = await fetch(member.user?.avatar!);
    const png = await sharp(await avatarRequest.arrayBuffer()).toFormat("png").toBuffer();
    const avatar = await loadImage(png);
    canvasCtx.drawImage(avatar, 50, 50, 128, 128);

    // Finalize
    const buffer = canvas.toBuffer("image/png");
    writeFileSync(join(__dirname, "./test.png"), buffer);

    // Upload to Guilded CDN

    return buffer;
}