import { createHmac } from "crypto";
import type { NextApiRequest, NextApiResponse } from "next";

import errorHandler, { errorEmbed } from "../../../lib/ErrorHandler";
import rest from "../../../lib/Guilded";
import prisma from "../../../lib/Prisma";

const PostVerifyRoute = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== "POST") return res.status(405).send("");
    const id = req.query.verificationId as string;
    const token = req.body.token as string | null;
    const forwarded = req.headers["x-forwarded-for"];
    const ip = typeof forwarded === "string" ? forwarded.split(/, /)[0] : req.socket.remoteAddress;

    if (!token) return res.status(400).json({ error: true, message: "Missing captcha token." });
    if (!ip) return res.status(400).json({ error: true, message: "Missing IP with request." });

    const captcha = await prisma.captcha.findFirst({ where: { id } });
    if (!captcha) return res.status(404).json({ error: true, message: "Invalid verification ID." });

    const server = await prisma.server.findFirst({ where: { serverId: captcha.serverId } });
    if (!server) return res.status(404).json({ error: true, message: "Invalid server ID." });

    const hashedIp = createHmac("sha256", process.env.HMAC_SECRET!).update(ip).digest("hex");
    const allPossiblePastAccounts = (await prisma.captcha.findMany({ where: { hashedIp } })).map((x) => x.triggeringUser);
    allPossiblePastAccounts.push(captcha.triggeringUser);

    const ban = await prisma.action.findFirst({ where: { serverId: captcha.serverId, targetId: { in: allPossiblePastAccounts }, expired: false, type: "BAN" } });
    if (ban) return res.status(403).json({ error: true, message: "You have been banned from this server." });

    const params = new URLSearchParams();
    params.append("secret", process.env.CLOUDFLARE_TURNSTILE_KEY!);
    params.append("response", token);
    params.append("remoteip", ip);
    console.log("making request to cloudflare");

    try {
        const req = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
            // @ts-ignore Formdata IS valid here
            body: params,
            method: "POST",
        });
        const json = await req.json();

        if (json.success) {
            console.log("updating captcha marked as true");
            await prisma.captcha.update({ where: { id: captcha.id }, data: { solved: true, hashedIp } });
            console.log("Removing muted role from user if still exists");
            if (server.muteRoleId) await rest.router.removeRoleFromMember(captcha.serverId, captcha.triggeringUser, server.muteRoleId);
            console.log("Adding member role to user if exists");
            if (server.memberRoleId) await rest.router.assignRoleToMember(captcha.serverId, captcha.triggeringUser, server.memberRoleId);
            return res.status(200).json({ error: false });
        }

        console.log(json);
        return res.status(500).json({ error: true, message: "There was an issue validating your captcha request." });
    } catch (e) {
        void errorHandler.send("Issue with site captcha verify", [errorEmbed(e as Error)]);
        console.error(e);
        return res.status(500).json({ error: true, message: "Internal Error." });
    }
};

export default PostVerifyRoute;
