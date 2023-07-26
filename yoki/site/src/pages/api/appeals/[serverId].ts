import { WebhookEmbed } from "@guildedjs/api";
import { stripIndents } from "common-tags";
import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";

import rest from "../../../guilded";
import errorHandler, { errorEmbed } from "../../../lib/ErrorHandler";
import prisma from "../../../prisma";
import { authOptions } from "../auth/[...nextauth]";

const PostAppealRoute = async (req: NextApiRequest, res: NextApiResponse) => {
    // Has to be POST; this is the only method available
    if (req.method !== "POST")
        return res.status(405).send("");
    const serverId = req.query.serverId as string;
    const appealContent = req.body.appealContent as string;

    if (!appealContent)
        return res.status(400).json({ error: true, message: "Must provide appeal content." });

    // Don't know who is appealing (need a Guilded login)
    const session = await unstable_getServerSession(req, res, authOptions);
    if (!session?.user.id)
        return res.status(401).json({ error: true, message: "Must be logged in to send appeal." });

    // Server needs to exist and have appeals enabled
    const server = await prisma.server.findFirst({ where: { serverId } });
    if (!server)
        return res.status(404).json({ error: true, message: "Invalid server ID." });
    else if (!server.appealChannelId)
        return res.status(404).json({ error: true, code: "NOT_ENABLED", message: "Server does not have appeals enabled." });

    // If they aren't banned, they can't appeal
    const existingBan = await rest.router.memberBans
        .serverMemberBanRead({ serverId: server.serverId, userId: session.user.id })
        .then((x) => x.serverMemberBan)
        .catch(() => null);
    if (!existingBan)
        return res.status(404).json({ error: true, code: "NOT_BANNED", message: "User is not banned." });

    try {
        await prisma.appeal.create({ data: { content: appealContent, serverId: server.serverId, creatorId: session.user.id } });
        await rest.router.chat.channelMessageCreate({
            channelId: server.appealChannelId,
            requestBody: {
                embeds: [
                    new WebhookEmbed()
                        .setTitle("User Appealed")
                        .setTimestamp()
                        .setColor(0x8060f6)
                        .setDescription(`${session.user.name} (\`${session.user.id}\`) has made an appeal for an unban.`)
                        .addFields([
                            {
                                name: "Reason",
                                value: `\`\`\`md\n${stripIndents(appealContent)}\n\`\`\``,
                            },
                        ])
                        .toJSON(),
                ],
            },
        });
        return res.status(200).json({ error: false });
    } catch (e) {
        void errorHandler.send("Issue with site appeal", [errorEmbed((e as Error).message)]);
        console.error(e);
        return res.status(500).json({ error: true, message: "Internal Error." });
    }
};

export default PostAppealRoute;
