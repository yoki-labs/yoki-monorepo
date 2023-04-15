import { Embed } from "@guildedjs/webhook-client";
import { stripIndents } from "common-tags";
import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";

import { authOptions } from "../auth/[...nextauth]";
import errorHandler, { errorEmbed } from "../../../lib/ErrorHandler";
import rest from "../../../lib/Guilded";
import prisma from "../../../lib/Prisma";

const PostAppealRoute = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== "POST") return res.status(405).send("");
    const session = await unstable_getServerSession(req, res, authOptions);
    const serverId = req.query.serverId as string;
    const appealContent = req.body.appealContent as string;

    if (!session?.user.id) return res.status(400).json({ error: true, message: "Must be logged in to send appeal." });
    if (!appealContent) return res.status(400).json({ error: true, message: "Must provide appeal content." });

    const server = await prisma.server.findFirst({ where: { serverId } });
    if (!server) return res.status(404).json({ error: true, message: "Invalid server ID." });
    if (!server.appealChannelId) return res.status(404).json({ error: true, code: "NOT_ENABLED", message: "Server does not have appeals enabled." });

    const existingBan = await rest.router
        .getMemberBan(server.serverId, session.user.id)
        .then((x) => x.serverMemberBan)
        .catch(() => null);
    if (!existingBan) return res.status(404).json({ error: true, code: "NOT_BANNED", message: "User is not banned." });

    try {
        await prisma.appeal.create({ data: { content: appealContent, serverId: server.serverId, creatorId: session.user.id } });
        await rest.router.createChannelMessage(server.appealChannelId, {
            embeds: [
                new Embed()
                    .setTitle("New Appeal")
                    .setTimestamp()
                    .setColor("GREEN")
                    .addFields([
                        {
                            name: "User",
                            value: `${session.user.name} (\`${session.user.id}\`)`,
                        },
                        {
                            name: "Content",
                            value: `\`\`\`${stripIndents(appealContent)}\`\`\``,
                        },
                    ])
                    .toJSON(),
            ],
        });
        return res.status(200).json({ error: false });
    } catch (e) {
        void errorHandler.send("Issue with site appeal", [errorEmbed(e)]);
        console.error(e);
        return res.status(500).json({ error: true, message: "Internal Error." });
    }
};

export default PostAppealRoute;
