import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/Prisma";
import rest from "../../../lib/Guilded";
import errorHandler, { errorEmbed } from "../../../lib/ErrorHandler";
import { Embed } from "@guildedjs/webhook-client";
import { stripIndents } from "common-tags";

const PostAppealRoute = async (req: NextApiRequest, res: NextApiResponse) => {
	if (req.method !== "POST") return res.status(405).send("");
	const serverId = req.query.serverId as string;
	const appealerId = req.body.appealerId as string;
	const appealContent = req.body.appealContent as string;

	if (!appealerId) return res.status(400).json({ error: true, message: "Must provide an user id for appeal." });
	if (!appealContent) return res.status(400).json({ error: true, message: "Must provide appeal content." });

	const server = await prisma.server.findFirst({ where: { serverId } });
	if (!server) return res.status(404).json({ error: true, message: "Invalid server ID." });
	if (!server.appealChannel) return res.status(404).json({ error: true, message: "Server does not have appeals enabled." });

	const existingBan = await rest.router.getMemberBan(server.serverId, appealerId).then(x => x.serverMemberBan).catch(() => null);
	if (!existingBan) return res.status(404).json({ error: true, message: "User is not banned." });

	try {
		await rest.router.createChannelMessage(server.appealChannel, {
			"embeds": [
				new Embed()
					.setTitle("New Appeal")
					.setTimestamp()
					.setColor("GREEN")
					.addFields([
						{
							"name": "User ID",
							"value": `\`${appealerId}\``
						},
						{
							"name": "Content",
							"value": `\`\`\`${appealContent}\`\`\``
						}
					])
					.toJSON()
			]
		});
		return res.status(200).json({ error: false })
	} catch (e) {
		errorHandler.send("Issue with site appeal", [errorEmbed(e)])
		console.error(e)
		return res.status(500).json({ error: true, message: "Internal Error." })
	}

};

export default PostAppealRoute;