import { Embed } from "@guildedjs/embeds";
import { Action, LogChannelType } from "@prisma/client";
import { stripIndents } from "common-tags";

import type Client from "../Client";
import amplitudeClient from "../utils/amplitude";
import { inlineCode } from "../utils/formatters";
import { FormatDate } from "../utils/util";

export default async (data: Action & { reasonMetaData?: string }, client: Client) => {
    const modLogChannel = await client.dbUtil.getLogChannel(data.serverId, LogChannelType.mod_actions);
    if (!modLogChannel) return;

    void amplitudeClient.logEvent({ event_type: "MEMBER_ACTION", user_id: data.executorId, event_properties: { serverId: data.serverId, targetId: data.targetId } });
    const message = await client.messageUtil.send(
        modLogChannel.channelId,
        new Embed()
            .setDescription(
                stripIndents`
					**Target:** <@${data.targetId}>
					**Type:** ${inlineCode(data.type)}
					**Reason:** ${data.reason ? inlineCode(data.reason) : "No reason provided."}  ${data.reasonMetaData ?? ""}
					${data.expiresAt ? `**Expiration:** ${inlineCode(FormatDate(data.expiresAt))}` : ""}
				`
            )
            .setTimestamp()
    );
    await client.dbUtil.populateActionMessage(data.id, message.channelId, message.id);
};
