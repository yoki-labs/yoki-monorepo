import { RestManager } from "@guildedjs/rest";

if (process.env.VERCEL_ENV !== "preview" && process.env.NODE_ENV === "production" && !process.env.GUILDED_TOKEN) throw new Error("Missing guilded token.");
const rest = new RestManager({ "token": process.env.GUILDED_TOKEN! });
export default rest;