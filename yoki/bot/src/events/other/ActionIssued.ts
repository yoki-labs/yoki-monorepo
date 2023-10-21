import { Action, LogChannelType, Severity } from "@prisma/client";
import { Colors } from "@yokilabs/utils";
import { GuildedImages } from "@yokilabs/utils/dist/src/images";

import type Client from "../../Client";
import type { Server } from "../../typings";
import { getActionAdditionalInfo, getActionFields, getActionInfo } from "../../utils/moderation";

export default async (data: Action, server: Server, client: Client) => {
    const modLogChannel = await client.dbUtil.getLogChannel(data.serverId, LogChannelType.mod_actions);
    if (!modLogChannel) return;

    const member = await client.members.fetch(server.serverId, data.targetId).catch(() => null);

    void client.amp.logEvent({ event_type: "MEMBER_ACTION", user_id: data.executorId, event_properties: { serverId: data.serverId, targetId: data.targetId, type: data.type } });
    const [title, description] = getActionInfo(data);

    const message = await client.messageUtil.sendLog({
        where: modLogChannel.channelId,
        serverId: server.serverId,
        author: {
            icon_url: member?.user?.avatar ?? GuildedImages.defaultAvatar,
            name: `${title} \u2022 ${member?.displayName ?? "Unknown user"}`,
        },
        description,
        occurred: data.createdAt.toISOString(),
        color: data.type === Severity.NOTE ? Colors.blockBackground : data.type === Severity.KICK ? Colors.yellow : Colors.red,
        fields: getActionFields(data),
        additionalInfo: getActionAdditionalInfo(data, server.getTimezone()),
    });
    if (message) await client.dbUtil.populateActionMessage(data.id, message.channelId, message.id);
};
