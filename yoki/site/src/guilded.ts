import { RestManager } from "@guildedjs/api";

if (process.env.VERCEL_ENV !== "preview" && process.env.CI !== "true" && !process.env.GUILDED_TOKEN) throw new Error("Missing guilded token.");
const rest = new RestManager({ token: process.env.GUILDED_TOKEN! });
export default rest;
