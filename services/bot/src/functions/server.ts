import Embed from "@guildedjs/embeds";
import { WebhookClient } from "@guildedjs/webhook-client";
import { stripIndents } from "common-tags";
import { nanoid } from "nanoid";
import JSONCache from "redis-json";

import { Action, CachedMember, LogChannelType, Server } from "../typings";
import Util from "./util";

export class ServerUtil extends Util {
    readonly cache = new JSONCache<CachedMember>(this.client.redis);

    getServer(serverId: string, createIfNotExists?: true): Promise<Server>;
    getServer(serverId: string, createIfNotExists: false): Promise<Server | null>;
    getServer(serverId: string, createIfNotExists = true) {
        return this.prisma.server.findUnique({ where: { serverId } }).then((server) => {
            if (!server && createIfNotExists) return this.createFreshServerInDatabase(serverId);
            return server ?? null;
        });
    }

    getLogChannel(serverId: string, type: LogChannelType) {
        return this.prisma.logChannel.findFirst({ where: { serverId, OR: [{ type }, { type: LogChannelType.ALL }] } });
    }

    getLogChannels(serverId: string) {
        return this.prisma.logChannel.findMany({ where: { serverId } });
    }

    getMuteRole(serverId: string) {
        return this.prisma.server.findFirst({ select: { muteRoleId: true }, where: { serverId } });
    }

    createFreshServerInDatabase(serverId: string, data?: Record<string, any>) {
        return this.prisma.server.create({
            data: {
                serverId,
                locale: "en-US",
                premium: false,
                blacklisted: false,
                muteRoleId: null,
                botJoinedAt: null,
                filterEnabled: false,
                kickInfractionThreshold: 20,
                muteInfractionThreshold: 15,
                banInfractionThreshold: 30,
                ...data,
            },
        });
    }

    addAction(data: Omit<Action, "id" | "referenceId" | "createdAt" | "updatedAt" | "logChannelI" | "expired" | "logChannelId" | "logChannelMessage">) {
        return this.prisma.action.create({
            data: {
                id: nanoid(17),
                createdAt: new Date(),
                updatedAt: null,
                expired: false,
                ...data,
            },
        });
    }

    populateActionMessage(id: string, channelId: string, messageId: string) {
        return this.prisma.action.update({ where: { id }, data: { logChannelId: channelId, logChannelMessage: messageId } });
    }

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

    async sendModLogMessageIfPossible(serverId: string, member: CachedMember, action: Action, logType: LogChannelType = LogChannelType.MOD_ACTION_LOG) {
        const modlog = await this.getLogChannel(serverId, logType);
        if (modlog) await this.sendModLogMessage(serverId, modlog.channelId, action, member);
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
