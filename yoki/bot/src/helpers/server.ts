import type { TeamMemberPayload } from "@guildedjs/guilded-api-typings";
import JSONCache from "redis-json";

import type { CachedMember } from "../typings";
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

    // Get a member from either the cache or the API
    async getMember(serverId: string, userId: string, cache?: boolean, force?: true): Promise<TeamMemberPayload>;
    async getMember(serverId: string, userId: string, cache = true, force = false): Promise<CachedMember> {
        if (!force) {
            const isCached = await this.getCachedMember(serverId, userId);
            if (isCached) return isCached;
        }

        return this.rest.router.getMember(serverId, userId).then(async (data) => {
            if (cache) await this.setMember(serverId, userId, data.member);
            return data.member;
        });
    }

    // Only get cached member
    async getCachedMember(serverId: string, userId: string) {
        return this.cache.get(buildMemberKey(serverId, userId));
    }

    // Cache this member
    setMember(serverId: string, userId: string, data: CachedMember) {
        return this.cache.set(buildMemberKey(serverId, userId), data, { expire: 900 });
    }

    removeMemberCache(serverId: string, userId: string) {
        return this.cache.del(buildMemberKey(serverId, userId));
    }

    async assignMultipleRoles(serverId: string, userId: string, roles: number[]) {
        const roleRequests: Promise<unknown>[] = [];
        for (const role of roles) {
            roleRequests.push(
                this.client.rest.router
                    .assignRoleToMember(serverId!, userId, role)
                    .then(() => role)
                    .catch(() => {
                        throw role;
                    })
            );
        }
        const responses = await Promise.allSettled(roleRequests);

        return {
            success: responses.filter((x) => x.status === "fulfilled").map((x) => (x as PromiseFulfilledResult<number>).value),
            failed: responses.filter((x) => x.status === "rejected").map((x) => (x as PromiseRejectedResult).reason),
        };
    }

    async removeMultipleRoles(serverId: string, userId: string, roles: number[]) {
        const roleRequests: Promise<unknown>[] = [];
        for (const role of roles) {
            roleRequests.push(
                this.client.rest.router
                    .removeRoleFromMember(serverId!, userId, role)
                    .then(() => role)
                    .catch(() => {
                        throw role;
                    })
            );
        }
        const responses = await Promise.allSettled(roleRequests);
        console.log(responses);

        return {
            success: responses.filter((x) => x.status === "fulfilled").map((x) => (x as PromiseFulfilledResult<number>).value),
            failed: responses.filter((x) => x.status === "rejected").map((x) => (x as PromiseRejectedResult).reason),
        };
    }
}

export const buildMemberKey = (serverId: string, memberId: string) => `member-${serverId}-${memberId}`;
