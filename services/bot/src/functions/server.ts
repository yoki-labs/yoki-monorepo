import { Embed } from "@guildedjs/embeds";
import { stripIndents } from "common-tags";
import JSONCache from "redis-json";

import type { Action, CachedMember } from "../typings";
import { Util } from "./util";

export class ServerUtil extends Util {
    readonly cache = new JSONCache<CachedMember>(this.client.redis);

    // Get webhook information from either the database, or create one in the server
    // async getWebhook(serverId: string, channelId: string, name?: string): Promise<WebhookClient | null> {
    //     const logChannel = await this.prisma.logChannel.findFirst({ select: { id: true, webhookId: true, webhookToken: true }, where: { serverId, channelId } });
    //     if (!logChannel) return null;
    //     if (logChannel.webhookId && logChannel.webhookToken) return new WebhookClient({ id: logChannel.webhookId, token: logChannel.webhookToken });
    //     const newWebhookFromAPI = await this.rest.router.createWebhook(serverId, { channelId, name: `Yoki ${name ?? "Moderation"}` });
    //     await this.prisma.logChannel.update({
    //         where: { id: logChannel.id },
    //         data: {
    //             channelId,
    //             serverId,
    //             webhookId: newWebhookFromAPI.webhook.id,
    //             webhookToken: newWebhookFromAPI.webhook.token!,
    //         },
    //     });
    //     return new WebhookClient({ id: newWebhookFromAPI.webhook.id, token: newWebhookFromAPI.webhook.token! });
    // }

    // Send a log message
    async sendModLogMessage(modLogChannelId: string, createdCase: Action & { reasonMetaData?: string }, member: CachedMember) {
        const msg = await this.client.messageUtil.send(
            modLogChannelId,
            new Embed()
                .setDescription(
                    stripIndents`
						**Target:** \`${member.user.name} (${createdCase.targetId})\`
						**Type:** \`${createdCase.type}\`
						**Reason:** \`${createdCase.reason ?? "NO REASON PROVIDED"} ${createdCase.reasonMetaData ?? ""}\` 
						${
                            createdCase.expiresAt
                                ? `**Expiration:** \`${createdCase.expiresAt.toLocaleDateString("en-US", {
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
        await this.client.dbUtil.populateActionMessage(createdCase.id, modLogChannelId, msg.id);
    }

    // Get a member from either the cache or the API
    async getMember(serverId: string, userId: string, cache = true, force = false) {
        if (!force) {
            const isCached = await this.cache.get(buildMemberKey(serverId, userId));
            if (isCached) return isCached;
        }

        return this.rest.router.getMember(serverId, userId).then(async (data) => {
            if (cache) await this.setMember(serverId, userId, data.member);
            return data.member;
        });
    }

    // Cache this member
    setMember(serverId: string, userId: string, data: CachedMember) {
        return this.cache.set(buildMemberKey(serverId, userId), { roleIds: data.roleIds, user: { id: data.user.id, name: data.user.name } }, { expire: 900 });
    }
}

export const buildMemberKey = (serverId: string, memberId: string) => `member-${serverId}-${memberId}`;
