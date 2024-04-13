import type { Schema } from "@guildedjs/guilded-api-typings";
import { Colors } from "@yokilabs/utils";

import { Server, Severity } from "../typings";
import BaseFilterUtil from "./base-filter";
import { FilteredContent } from "./content-filter";
import { Member } from "guilded.js";

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

    async checkForSpam(server: Server, member: Member, channelId: string, mentions: Schema<"Mentions"> | undefined, resultingAction: () => unknown): Promise<boolean> {
        void this.client.amp.logEvent({ event_type: "SPAM_SCAN", user_id: member.id, event_properties: { serverId: server.serverId } });
        // Only do it for a specific server
        const key = `${server.serverId}:${member.id}`;

        let instance = this.messageCounter.get(key);

        // Have not sent messages in "awhile"
        if (!instance) {
            instance = this.messageCounter
                .set(key, {
                    count: 1,
                    timeout: setTimeout(() => this.messageCounter.delete(key), this.spamPeriod),
                    mentions: 0,
                })
                .get(key);
        } else if (++instance.count >= server.spamFrequency) {
            this.onSpam(server, key, member.id, instance);

            // Warn/mute/kick/ban
            await this.dealWithUser(
                member,
                server,
                channelId,
                FilteredContent.Message,
                resultingAction,
                `Spam filter tripped`,
                server.spamInfractionPoints,
                Severity.WARN,
                null,
                SpamType.Content
            );

            return true;
        }

        instance = instance!;

        instance.mentions += mentions?.users?.length ?? 0;

        // Mention spam
        if (instance.mentions >= server.spamMentionFrequency) {
            this.onSpam(server, key, member.id, instance);

            await this.dealWithUser(
                member,
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
            return true;
        }

        return false;
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

    override onUserWarn(userId: string, _serv: Server, channelId: string | null, _filteredContent: FilteredContent, spamType: SpamType) {
        return this.client.messageUtil.sendWarningBlock(
            channelId!,
            `Stop spamming`,
            `<@${userId}>, you have been posting too many ${
                spamType === SpamType.Mention ? "mentions" : "messages"
            } in a short period of time. This is a warning for you to not do it again, otherwise moderation actions may be taken against you.`,
            undefined,
            { isPrivate: true }
        );
    }

    override onUserMute(userId: string, _serv: Server, channelId: string | null, _filteredContent: FilteredContent, spamType: SpamType) {
        return this.client.messageUtil.sendEmbed(
            channelId!,
            {
                title: `:mute: You have been muted`,
                description: `<@${userId}>, you have been muted for posting too many ${spamType === SpamType.Mention ? "mentions" : "messages"} in a short period of time.`,
                color: Colors.red,
            },
            { isPrivate: true }
        );
    }
}
