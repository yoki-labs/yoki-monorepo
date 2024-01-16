import { WebhookEmbed } from "@guildedjs/api";
import { Colors, formatDate } from "@yokilabs/utils";
import { stripIndents } from "common-tags";
import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";

import { authOptions } from "../auth/[...nextauth]";
import rest from "../../../guilded";
import errorHandler, { errorEmbed } from "../../../lib/ErrorHandler";
import prisma from "../../../prisma";
import { appealWaitingTime } from "../../../utils/appealUtil";

const PostAppealRoute = async (req: NextApiRequest, res: NextApiResponse) => {
    // Has to be allowed method; this is the only method available
    if (req.method !== "POST") return res.status(405).send("");

    const serverId = req.query.serverId as string;

    const { content } = req.body;

    if (typeof content !== "string" || content.length < 10 || content.length > 1000)
        return res.status(400).json({ error: true, message: "Content must be a string that has length between 10 and 1000." });

    // Don't know who is appealing (need a Guilded login)
    const session = await unstable_getServerSession(req, res, authOptions);
    if (!session?.user.id) return res.status(401).json({ error: true, message: "Must be logged in to use this function." });

    // Server needs to exist and have appeals enabled
    const server = await prisma.server.findFirst({ where: { serverId } });
    if (!server) return res.status(404).json({ error: true, message: "Invalid server ID." });
    else if (!(server.appealsEnabled && server.appealChannelId)) return res.status(403).json({ error: true, message: "Server does not have appeals enabled." });

    const memberBan = await rest.router.memberBans
        .serverMemberBanRead({ serverId: server.serverId, userId: session.user.id })
        .then((x) => x.serverMemberBan)
        .catch(() => null);

    // No purpose in appealing
    if (!memberBan) return res.status(403).json({ error: true, message: "You are not banned from this server." });

    const previousAppeals = await prisma.appeal.findMany({
        orderBy: [{ createdAt: "desc" }],
        where: {
            serverId,
            creatorId: session.user.id!,
        },
    });

    const elapsedTime = Date.now() - (previousAppeals[0]?.createdAt.getTime() ?? 0);

    // 5 days haven't been waited through
    if (elapsedTime < appealWaitingTime) return res.status(403).json({ error: true, message: "It's too early to appeal again." });

    try {
        await prisma.appeal.create({ data: { content, serverId: server.serverId, creatorId: session.user.id } });
        await rest.router.chat.channelMessageCreate({
            channelId: server.appealChannelId,
            requestBody: {
                embeds: [
                    new WebhookEmbed()
                        .setAuthor(`${memberBan.user.name} \u2022 New appeal`, memberBan.user.avatar)
                        .setTimestamp()
                        .setColor(Colors.blockBackground)
                        .setDescription(`<@${memberBan.user.id}> (\`${memberBan.user.id}\`) has made an appeal for an unban.`)
                        .addFields([
                            {
                                name: "Appeal reason",
                                value: `\`\`\`md\n${stripIndents(content.replaceAll("```", "'''"))}\n\`\`\``,
                            },
                            {
                                name: "Additional info",
                                value: stripIndents`
                                    **Last banned:** ${formatDate(new Date(memberBan.createdAt), server.timezone)} (EST)
                                `,
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
