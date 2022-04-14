import { stripIndents } from "common-tags";
import { nanoid } from "nanoid";
import JSONCache from "redis-json";

import { Action, CachedMember, LogChannelType } from "../typings";
import Util from "./util";

export class ServerUtil extends Util {
    readonly cache = new JSONCache<CachedMember>(this.client.redis);

    getServerFromDatabase(serverId: string) {
        return this.prisma.server.findUnique({ where: { serverId } });
    }

    getModLogChannel(serverId: string) {
        return this.prisma.logChannel.findFirst({ where: { serverId, type: LogChannelType.MOD_ACTION_LOG } });
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
                referenceId: nanoid(17),
                createdAt: new Date(),
                updatedAt: null,
                expired: false,
                ...data,
            },
        });
    }

    populateActionMessage(id: number, channelId: string, messageId: string) {
        return this.prisma.action.update({ where: { id }, data: { logChannelId: channelId, logChannelMessage: messageId } });
    }

    async sendModLogMessage(modLogChannelId: string, createdCase: Action & { reasonMetaData?: string }, member: CachedMember) {
        const msg = await this.client.messageUtil.send(
            modLogChannelId,
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
        );
        await this.client.serverUtil.populateActionMessage(createdCase.id, msg.message.channelId, msg.message.id);
    }

    async getMember(serverId: string, userId: string, cache = true, force = false) {
        if (!force) {
            const isCached = await this.cache.get(buildMemberKey(serverId, userId));
            if (isCached) return isCached;
        }

        return this.rest.router.getMember(serverId, userId).then((data) => {
            if (cache)
                void this.cache.set(
                    buildMemberKey(serverId, userId),
                    { roleIds: data.member.roleIds, user: { id: data.member.user.id, name: data.member.user.name } },
                    { expire: 900 }
                );
            return data.member;
        });
    }
}

export const buildMemberKey = (serverId: string, memberId: string) => `member-${serverId}-${memberId}`;
