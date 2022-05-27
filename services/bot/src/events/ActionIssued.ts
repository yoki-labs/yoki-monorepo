import { Embed } from "@guildedjs/embeds";
import { Action, LogChannelType } from "@prisma/client";
import { stripIndents } from "common-tags";

import type Client from "../Client";
import { inlineCode } from "../formatters";

export default async (data: Action & { reasonMetaData?: string }, client: Client) => {
    const modLogChannel = await client.dbUtil.getLogChannel(data.serverId, LogChannelType.MOD_ACTION_LOG);
    if (!modLogChannel) return;

    const message = await client.messageUtil.send(
        modLogChannel.channelId,
        new Embed()
            .setDescription(
                stripIndents`
					**Target:** <@${data.targetId}>
					**Type:** ${inlineCode(data.type)}
					**Reason:** ${data.reason ? inlineCode(data.reason) : "No reason provided."}  ${data.reasonMetaData ?? ""}
					${
                        data.expiresAt
                            ? `**Expiration:** ${inlineCode(
                                  data.expiresAt.toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                  })
                              )}`
                            : ""
                    }
				`
            )
            .setTimestamp()
    );
    await client.dbUtil.populateActionMessage(data.id, message.channelId, message.id);
};
