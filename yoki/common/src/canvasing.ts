import { GuildedImages } from "@yokilabs/utils";
import { CanvasRenderingContext2D, createCanvas, loadImage, registerFont } from "canvas";
import fetch from "node-fetch";
import path from "path";
import sharp from "sharp";

export function registerCanvasing() {
    // const fontPath = path.join(process.cwd(), "node_modules/@fontsource/space-mono/files/space-mono-latin-700-normal.woff");
    const fontPath = path.join(process.cwd(), "../../assets/space-mono/ttf/space-mono-latin-700-normal.ttf");

    console.log("Setting canvas font", { fontPath });
    registerFont(fontPath, { family: "Space Mono" });
}

export async function generateUserJoinBanner(name: string, avatarUrl?: string | null): Promise<Buffer> {
    // const name = "01234567890123456789012345678901";
    // const name = "0";
    // const name = member.user!.name;

    // Context
    const canvas = createCanvas(600, 250);
    const canvasCtx = canvas.getContext("2d");

    // Background
    const gradient = canvasCtx.createLinearGradient(0, 0, canvas.width, canvas.height * 2.5);
    gradient.addColorStop(0, "#1D142B");
    gradient.addColorStop(0.4, "#07050F");
    gradient.addColorStop(0.9, "#281C39");

    canvasCtx.fillStyle = gradient;
    canvasCtx.fillRect(0, 0, 600, 250);

    // Text
    const fontSize = 32 - name.length * 0.65;
    const highlightPadding = fontSize / 5;
    canvasCtx.font = `bold ${fontSize}px "Space Mono", mono, sans-serif`;

    const prefixLength = canvasCtx.measureText(`Welcome, `);
    const nameLength = canvasCtx.measureText(`@${name}`);
    const suffixLength = canvasCtx.measureText(`, to the server!`);

    const fullTextLength = prefixLength.width + nameLength.width + suffixLength.width;

    // We are manually centering it to highlight the name
    const textStart = (canvas.width - fullTextLength) / 2;
    const nameStart = textStart + prefixLength.width;

    // Highlight the name
    // 1. Padding needs to start above and before the name
    // 2. highlightPadding * 2, because of padding on both sides
    canvasCtx.fillStyle = "#9E52FD33";
    canvasCtx.fillRect(nameStart - highlightPadding, 200 - fontSize / 1.5 - highlightPadding * 2, nameLength.width + highlightPadding * 2, fontSize + highlightPadding * 2);

    // canvasCtx.textAlign = "center";
    canvasCtx.fillStyle = "#FFFFFF";
    // canvasCtx.fillText(`Welcome @${member.username} to the server!`, 300, 200, 600);
    canvasCtx.fillText(`Welcome, `, textStart, 200, 600);
    canvasCtx.fillStyle = "#CCA5FC";
    canvasCtx.fillText(`@${name}`, textStart + prefixLength.width, 200, 600);
    canvasCtx.fillStyle = "#FFFFFF";
    canvasCtx.fillText(`, to the server!`, textStart + prefixLength.width + nameLength.width, 200, 600);

    // Avatar
    const avatarRequest = await fetch(avatarUrl ?? GuildedImages.defaultAvatar);
    const png = await sharp(await avatarRequest.arrayBuffer())
        .toFormat("png")
        .toBuffer();
    const avatar = await loadImage(png);

    canvasCtx.save();
    roundImage(canvasCtx, 250, 50, 100, 100, 50);
    canvasCtx.clip();
    canvasCtx.drawImage(avatar, 250, 50, 100, 100);
    canvasCtx.restore();

    // Finalize
    return canvas.toBuffer("image/png");
}

function roundImage(canvasCtx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
    canvasCtx.beginPath();
    canvasCtx.moveTo(x + radius, y);

    // From right corner start of radius to right corner end of radius (right -> bottom)
    canvasCtx.lineTo(x + width - radius, y);
    canvasCtx.quadraticCurveTo(x + width, y, x + width, y + radius);

    // From right to
    canvasCtx.lineTo(x + width, y + height - radius);
    canvasCtx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);

    canvasCtx.lineTo(x + radius, y + height);
    canvasCtx.quadraticCurveTo(x, y + height, x, y + height - radius);

    canvasCtx.lineTo(x, y + radius);
    canvasCtx.quadraticCurveTo(x, y, x + radius, y);

    canvasCtx.closePath();
}
