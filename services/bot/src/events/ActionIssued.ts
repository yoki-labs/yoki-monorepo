import { Action, LogChannelType, Severity } from "@prisma/client";

import type Client from "../Client";
import { Colors } from "../utils/color";
import { getActionAdditionalInfo, getActionFields, getActionInfo } from "../utils/moderation";

export default async (data: Action, client: Client) => {
    const modLogChannel = await client.dbUtil.getLogChannel(data.serverId, LogChannelType.mod_actions);
    if (!modLogChannel) return;

    const [title, description] = getActionInfo(client, data);

    const message = await client.messageUtil.sendLog({
        where: modLogChannel.channelId,
        title,
        description,
        occurred: data.createdAt.toISOString(),
        color: data.type === Severity.NOTE ? Colors.dull : data.type === Severity.KICK ? Colors.yellow : Colors.red,
        fields: getActionFields(data),
        additionalInfo: getActionAdditionalInfo(data),
    });

    await client.dbUtil.populateActionMessage(data.id, message.channelId, message.id);
};
