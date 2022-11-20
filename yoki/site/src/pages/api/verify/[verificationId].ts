import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/Prisma";
import FormData from "form-data"
import rest from "../../../lib/Guilded";
import { createHmac } from "crypto";

const PostVerifyRoute = async (req: NextApiRequest, res: NextApiResponse) => {
	if(req.method !== "POST") return res.status(405).send("");
	const id = req.query.id as string;
	const token = req.body.token as string | null;
	const forwarded = req.headers['x-forwarded-for'];
	const ip = typeof forwarded === 'string' ? forwarded.split(/, /)[0] : req.socket.remoteAddress;

	if(!token) return res.status(400).json({ error: true, message: "Missing captcha token." });
	if(!ip) return res.status(400).json({ error: true, message: "Missing IP with request."});

	const captcha = await prisma.captcha.findFirst({ where: { id } });
	if(!captcha) return res.status(404).json({ error: true, message: "Invalid verification ID."})

	const server = await prisma.server.findFirst({ where: { serverId: captcha.serverId }});
	if(!server) return res.status(404).json({ error: true, message: "Invalid server ID."});

	const hashedIp = createHmac("sha256", process.env.HMAC_SECRET!).update(ip).digest("hex");
	const allPossiblePastAccounts = (await prisma.captcha.findMany({ "where": { hashedIp }})).map(x => x.triggeringUser);
	allPossiblePastAccounts.push(captcha.triggeringUser);

	const ban = await prisma.action.findFirst({ "where": { "serverId": captcha.serverId, "targetId": { "in": allPossiblePastAccounts }, "expired": false, "type": "BAN" } });
	if (ban) return res.status(403).json({ error: true, message: "You have been banned from this server."});

	const formData = new FormData();
	formData.append('secret', process.env.CLOUDFLARE_TURNSTILE_KEY!);
	formData.append('response', token);
	formData.append('remoteip', ip);

	try {
		const req = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
			// @ts-ignore
			body: formData,
			method: "POST"
		})

		const json = await req.json();
		if (json.success) {
			await prisma.captcha.update({ where: { id: captcha.id }, "data": { "solved": true, hashedIp }});
			if(server.muteRoleId) await rest.router.removeRoleFromMember(captcha.serverId, captcha.triggeringUser, server.muteRoleId);
			return res.status(200).json({ error: false });
		}
		return res.status(200).json({ error: true, message: "There was an issue validating your captcha request."});
	} catch (e) {
		return res.status(500).json({ error: true, message: "Internal Error."})
	}

};

export default PostVerifyRoute;