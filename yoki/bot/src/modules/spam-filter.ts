import { Colors } from "@yokilabs/util";
import type { MentionsPayload, Message } from "guilded.js";

import { Server, Severity } from "../typings";
import BaseFilterUtil from "./base-filter";
import { FilteredContent } from "./content-filter";

interface Counter {
    count: number;
    timeout: NodeJS.Timeout;
    mentions: number;
}

enum SpamType {
    Content,
    Mention,
}

export class SpamFilterUtil extends BaseFilterUtil<SpamType> {
    readonly spamPeriod = 5000;

    readonly messageCounter = new Map<string, Counter>();

    checkForMessageSpam(server: Server, message: Message) {
        return this.checkForSpam(server, message.authorId, message.channelId, message.mentions, () => this.client.messages.delete(message.channelId, message.id));
    }

    async checkForSpam(server: Server, userId: string, channelId: string, mentions: MentionsPayload | undefined, resultingAction: () => unknown) {
        void this.client.amp.logEvent({ event_type: "SPAM_SCAN", user_id: userId, event_properties: { serverId: server.serverId } });
        // Only do it for a specific server
        const key = `${server.serverId}:${userId}`;

        let instance = this.messageCounter.get(key);

        // Have not sent messages in "awhile"
        if (!instance)
            instance = this.messageCounter
                .set(key, {
                    count: 1,
                    timeout: setTimeout(() => this.messageCounter.delete(key), this.spamPeriod),
                    mentions: 0,
                })
                .get(key);
        else if (++instance.count >= server.spamFrequency) {
            this.onSpam(server, key, userId, instance);
            // Warn/mute/kick/ban
            await this.dealWithUser(
                userId,
                server,
                channelId,
                FilteredContent.Message,
                resultingAction,
                `Spam filter tripped.`,
                server.spamInfractionPoints,
                Severity.WARN,
                null,
                SpamType.Content
            );
        }

        instance = instance!;

        instance.mentions += mentions?.users?.length ?? 0;

        // Mention spam
        if (instance.mentions >= server.spamMentionFrequency) {
            this.onSpam(server, key, userId, instance);

            await this.dealWithUser(
                userId,
                server,
                channelId,
                FilteredContent.Message,
                resultingAction,
                `Mention spam filter tripped.`,
                server.spamInfractionPoints,
                Severity.MUTE,
                null,
                SpamType.Mention
            );
        }
    }

    onSpam(server: Server, key: string, userId: string, instance: Counter) {
        clearTimeout(instance.timeout);
        this.messageCounter.delete(key);

        void this.client.amp.logEvent({
            event_type: "SPAM_ACTION",
            user_id: userId,
            event_properties: { serverId: server.serverId, counter: instance.count, mentions: instance.mentions, threshold: server.spamFrequency },
        });
    }

    override onUserWarn(userId: string, _serv: Server, channelId: string | null, filteredContent: FilteredContent, spamType: SpamType) {
        // When channels and messages get filtered
        if (filteredContent < FilteredContent.ChannelContent)
            return this.client.messageUtil.sendWarningBlock(
                channelId!,
                `Stop spamming`,
                `**Alert:** <@${userId}>, you have been posting too many ${
                    spamType === SpamType.Mention ? "mentions" : "messages"
                } in a short period of time. This is a warning for you to not do it again, otherwise moderation actions may be taken against you.`,
                undefined,
                { isPrivate: true }
            );
        // TODO: DM user
        return 0;
    }

    override onUserMute(userId: string, _serv: Server, channelId: string | null, filteredContent: FilteredContent, spamType: SpamType) {
        // When channels and messages get filtered
        if (filteredContent < FilteredContent.ChannelContent)
            return this.client.messageUtil.sendEmbed(
                channelId!,
                {
                    title: `:mute: You have been muted`,
                    description: `**Alert:** <@${userId}>, you have been muted for posting too many ${
                        spamType === SpamType.Mention ? "mentions" : "messages"
                    } in a short period of time.`,
                    color: Colors.red,
                },
                { isPrivate: true }
            );
        // TODO: DM user
        return 0;
    }
}
