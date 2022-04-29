import Embed from "@guildedjs/embeds";
import { WebhookClient } from "@guildedjs/webhook-client";
import { stripIndents } from "common-tags";
import { nanoid } from "nanoid";
import JSONCache from "redis-json";

import { Action, CachedMember, LogChannelType, Server } from "../typings";
import Util from "./util";

export class ServerUtil extends Util {
    readonly cache = new JSONCache<CachedMember>(this.client.redis);

    async getWebhook(serverId: string, channelId: string, name?: string) {
        const webhook = await this.prisma.webhook.findFirst({ where: { serverId, channelId } });
        if (webhook) return new WebhookClient({ id: webhook.webhookId, token: webhook.webhookToken });
        const newWebhookFromAPI = await this.rest.router.createWebhook(serverId, { channelId, name: `Yoki ${name ?? "Moderation"}` });
        await this.prisma.webhook.create({
            data: {
                channelId,
                serverId,
                webhookId: newWebhookFromAPI.webhook.id,
                webhookToken: newWebhookFromAPI.webhook.token!,
            },
        });
        return new WebhookClient({ id: newWebhookFromAPI.webhook.id, token: newWebhookFromAPI.webhook.token! });
    }

    async sendModLogMessage(serverId: string, modLogChannelId: string, createdCase: Action & { reasonMetaData?: string }, member: CachedMember) {
        const webhook = await this.client.serverUtil.getWebhook(serverId, modLogChannelId);
        const msg = await webhook.send("", [
            new Embed()
                .setDescription(
                    stripIndents`
						**Target:** \`${member.user.name} (${createdCase.targetId})\`
						**Type:** \`${createdCase.type}\`
						**Reason:** \`${createdCase.reason ?? "NO REASON PROVIDED"}\` ${createdCase.reasonMetaData ?? ""}
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
                .setTimestamp(),
        ]);
        await this.client.serverUtil.populateActionMessage(createdCase.id, modLogChannelId, msg.id);
    }

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

    setMember(serverId: string, userId: string, data: CachedMember) {
        return this.cache.set(buildMemberKey(serverId, userId), { roleIds: data.roleIds, user: { id: data.user.id, name: data.user.name } }, { expire: 900 });
    }
}

export const buildMemberKey = (serverId: string, memberId: string) => `member-${serverId}-${memberId}`;
