import type { ServerChannelPayload } from "@guildedjs/guilded-api-typings";

import type { CachedChannel } from "../typings";
import { Util } from "./util";

export class ChannelUtil extends Util {
	readonly cache = new Map<string, ServerChannelPayload>();

	// Get a channel from either the cache or the API
	async getChannel(channelId: string, cache?: boolean, force?: true): Promise<ServerChannelPayload>;
	async getChannel(channelId: string, cache = true, force = false): Promise<CachedChannel> {
		if (!force) {
			const isCached = await this.getCachedChannel(channelId);
			if (isCached) return isCached;
		}

		return this.rest.router.getChannel(channelId).then(async (data) => {
			if (cache) await this.setChannel(channelId, data.channel);
			return data.channel;
		});
	}

	// Only get cached member
	getCachedChannel(userId: string) {
		return this.cache.get(buildChannelKey(userId));
	}

	// Cache this member
	setChannel(userId: string, data: ServerChannelPayload) {
		return this.cache.set(
			buildChannelKey(userId),
			data
		);
	}

	removeChannelCache(userId: string) {
		return this.cache.delete(buildChannelKey(userId));
	}
}

export const buildChannelKey = (channelId: string) => `channel-${channelId}`;
