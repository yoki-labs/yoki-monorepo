import type { ChatMessagePayload } from "@guildedjs/guilded-api-typings";

import type { Server } from "../typings";
import { Colors } from "../utils/color";
import BaseFilterUtil from "./base-filter";
import { FilteredContent } from "./content-filter";

export class SpamFilterUtil extends BaseFilterUtil {
    readonly spamPeriod = 5000;

    messageCounter = new Map<string, { count: number; timeout: NodeJS.Timeout }>();

    checkForMessageSpam(server: Server, message: ChatMessagePayload) {
        return this.checkForSpam(server, message.createdBy, message.channelId);
    }

    async checkForSpam(server: Server, userId: string, channelId: string) {
        // Only do it for a specific server
        const key = `${server.serverId}:${userId}`;

        const instance = this.messageCounter.get(key);

        // Have not sent messages in "awhile"
        if (!instance)
            this.messageCounter.set(key, {
                count: 1,
                timeout: setTimeout(() => this.messageCounter.delete(key), this.spamPeriod),
            });
        else if (++instance.count >= server.spamFrequency) {
            clearTimeout(instance.timeout);
            this.messageCounter.delete(key);

            // Warn/mute/kick/ban
            await this.dealWithUser(userId, server, channelId, FilteredContent.Message, `Spam filter tripped.`);
        }
    }

    override onUserWarn(userId: string, _serv: Server, channelId: string | null, filteredContent: FilteredContent) {
        // When channels and messages get filtered
        if (filteredContent < FilteredContent.ChannelContent)
            return this.client.messageUtil.sendWarningBlock(
                channelId!,
                `Stop spamming`,
                `**Alert:** <@${userId}>, you have been posting too many messages in a short period of time. This is a warning for you to not do it again, otherwise moderation actions may be taken against you.`,
                undefined,
                { isPrivate: true }
            );
        // TODO: DM user
        return 0;
    }

    override onUserMute(userId: string, _serv: Server, channelId: string | null, filteredContent: FilteredContent) {
        // When channels and messages get filtered
        if (filteredContent < FilteredContent.ChannelContent)
            return this.client.messageUtil.sendValueBlock(
                channelId!,
                `:mute: You have been muted`,
                `**Alert:** <@${userId}>, you have been muted for posting too many messages in a short period of time.`,
                Colors.red,
                undefined,
                { isPrivate: true }
            );
        // TODO: DM user
        return 0;
    }
}
