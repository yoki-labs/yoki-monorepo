import { RestManager } from "@guildedjs/api";
// import { registerCanvasing } from "@yoki/common";

if (process.env.VERCEL_ENV !== "preview" && process.env.CI !== "true" && !process.env.GUILDED_TOKEN) throw new Error("Missing guilded token.");
const rest = new RestManager({ token: process.env.GUILDED_TOKEN! });
export default rest;
export const clientRest = new RestManager({ token: process.env.GUILDED_TOKEN!, proxyURL: "https://www.guilded.gg/api" });
export const mediaRest = new RestManager({ token: process.env.GUILDED_TOKEN!, proxyURL: "https://media.guilded.gg/media" });

// registerCanvasing();
