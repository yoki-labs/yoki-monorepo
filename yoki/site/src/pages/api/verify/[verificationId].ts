import { createHmac } from "crypto";
import type { NextApiRequest, NextApiResponse } from "next";

import rest from "../../../guilded";
import errorHandler, { errorEmbed } from "../../../lib/ErrorHandler";
import prisma from "../../../prisma";

const PostVerifyRoute = async (req: NextApiRequest, res: NextApiResponse) => {
    // Has to be POST; cannot be other method, since there are no other functions than POST
    if (req.method !== "POST")
        return res.status(405).send("");

    // Verification info to verify
    const id = req.query.verificationId as string;
    const token = req.body.token as string | null;
    const forwarded = req.headers["x-forwarded-for"];
    const ip = typeof forwarded === "string" ? forwarded.split(/, /)[0] : req.socket.remoteAddress;

    // Invalid parameters
    if (!token)
        return res.status(400).json({ error: true, message: "Missing captcha token." });
    if (!ip)
        return res.status(400).json({ error: true, message: "Missing IP with request." });

    // Don't know what captcha to solve
    // While this allows user to complete captcha for someone else, it also doesn't require
    // logging in with Guilded
    const captcha = await prisma.captcha.findFirst({ where: { id } });
    if (!captcha)
        return res.status(404).json({ error: true, message: "Invalid verification ID." });

    // Verify to join what? Make sure it exists
    const server = await prisma.server.findFirst({ where: { serverId: captcha.serverId } });
    if (!server)
        return res.status(404).json({ error: true, message: "Invalid server ID." });

    // If DB leak happens, make sure that at least IPs are safe
    const hashedIp = createHmac("sha256", process.env.HMAC_SECRET!).update(ip).digest("hex");
    const allPossiblePastAccounts = (await prisma.captcha.findMany({ where: { hashedIp } })).map((x) => x.triggeringUser);
    allPossiblePastAccounts.push(captcha.triggeringUser);

    // TODO: Use Guilded API instead
    const ban = await prisma.action.findFirst({ where: { serverId: captcha.serverId, targetId: { in: allPossiblePastAccounts }, expired: false, type: "BAN" } });
    if (ban)
        return res.status(403).json({ error: true, message: "You have been banned from this server." });

    // For Cloudflare's easy captcha
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
            // To not have to verify again
            console.log("updating captcha marked as true");
            await prisma.captcha.update({ where: { id: captcha.id }, data: { solved: true, hashedIp } });

            // Remove mute role if it was added; mute role in this case was added for unverified people
            // instead of it being moderation thing
            console.log("Removing muted role from user if still exists - ", server.muteRoleId);
            if (server.muteRoleId)
                await rest.router.roleMembership.roleMembershipDelete({ serverId: captcha.serverId, userId: captcha.triggeringUser, roleId: server.muteRoleId });

            // Add member role to allow access throughout the server
            console.log("Adding member role to user if exists - ", server.memberRoleId);
            if (server.memberRoleId)
                await rest.router.roleMembership.roleMembershipCreate({ serverId: captcha.serverId, userId: captcha.triggeringUser, roleId: server.memberRoleId });

            console.log("All done");
            return res.status(200).json({ error: false });
        }

        console.log(json);
        return res.status(500).json({ error: true, message: "There was an issue validating your captcha request." });
    } catch (e) {
        void errorHandler.send("Issue with site captcha verify", [errorEmbed((e as Error).message)]);
        console.error(e);
        return res.status(500).json({ error: true, message: "Internal Error." });
    }
};

export default PostVerifyRoute;
