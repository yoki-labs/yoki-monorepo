import { Action, LogChannelType, Severity } from "@prisma/client";

import type Client from "../../Client";
import type { Server } from "../../typings";
import { Colors } from "../../utils/color";
import { getActionAdditionalInfo, getActionFields, getActionInfo } from "../../utils/moderation";

export default async (data: Action, server: Server, client: Client) => {
	const modLogChannel = await client.dbUtil.getLogChannel(data.serverId, LogChannelType.mod_actions);
	if (!modLogChannel) return;

	void client.amp.logEvent({ event_type: "MEMBER_ACTION", user_id: data.executorId, event_properties: { serverId: data.serverId, targetId: data.targetId, type: data.type } });
	const [title, description] = getActionInfo(client, data);

	const message = await client.messageUtil.sendLog({
		where: modLogChannel.channelId,
		serverId: server.serverId,
		title,
		description,
		occurred: data.createdAt.toISOString(),
		color: data.type === Severity.NOTE ? Colors.dull : data.type === Severity.KICK ? Colors.yellow : Colors.red,
		fields: getActionFields(data),
		additionalInfo: getActionAdditionalInfo(data, server.getTimezone()),
	});
	if (message) await client.dbUtil.populateActionMessage(data.id, message.channelId, message.id);
};
