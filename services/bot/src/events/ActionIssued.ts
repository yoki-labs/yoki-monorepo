import { Embed } from "@guildedjs/embeds";
import { Action, LogChannelType } from "@prisma/client";
import { stripIndents } from "common-tags";

import type Client from "../Client";
import type { CachedMember } from "../typings";

export default async (data: Action & { reasonMetaData?: string }, member: CachedMember | null, client: Client) => {
    const modLogChannel = await client.dbUtil.getLogChannel(data.serverId, LogChannelType.MOD_ACTION_LOG);
    if (!modLogChannel) return;
    member ??= await client.serverUtil.getMember(data.serverId, data.targetId);

    const message = await client.messageUtil.send(
        modLogChannel.channelId,
        new Embed()
            .setDescription(
                stripIndents`
					**Target:** \`${member.user.name} (${data.targetId})\`
					**Type:** \`${data.type}\`
					**Reason:** \`${data.reason ?? "NO REASON PROVIDED"} ${data.reasonMetaData ?? ""}\` 
					${
                        data.expiresAt
                            ? `**Expiration:** \`${data.expiresAt.toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                              })}\``
                            : ""
                    }
				`
            )
            .setTimestamp()
    );
    await client.dbUtil.populateActionMessage(data.id, message.channelId, message.id);
};
