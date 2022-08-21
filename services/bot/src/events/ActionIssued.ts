import { Embed } from "@guildedjs/embeds";
import { Action, LogChannelType } from "@prisma/client";
import { stripIndents } from "common-tags";

import type Client from "../Client";
import { inlineCode } from "../utils/formatters";
import { FormatDate } from "../utils/util";

export default async (data: Action & { reasonMetaData?: string }, client: Client) => {
    const modLogChannel = await client.dbUtil.getLogChannel(data.serverId, LogChannelType.mod_actions);
    if (!modLogChannel) return;

    const message = await client.messageUtil.send(
        modLogChannel.channelId,
        new Embed()
            .setDescription(
                stripIndents`
					**Type:** ${inlineCode(data.type)}
					**Target:** <@${data.targetId}>
					**Mod:** <@${data.executorId}>${data.expiresAt ? `\n**Expiration:** ${inlineCode(FormatDate(data.expiresAt))}` : ""}
					**Reason:** ${data.reason ? inlineCode(data.reason) : "No reason provided."}  ${data.reasonMetaData ?? ""}	
				`
            )
            .setTimestamp()
    );
    await client.dbUtil.populateActionMessage(data.id, message.channelId, message.id);
};
