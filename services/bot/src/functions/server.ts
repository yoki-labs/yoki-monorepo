import type { TeamMemberPayload } from "@guildedjs/guilded-api-typings";
import JSONCache from "redis-json";

import { Action, LogChannelType } from "../typings";
import Util from "./util";

export class ServerUtil extends Util {
    readonly cache = new JSONCache<TeamMemberPayload>(this.client.redis);

    getServerFromDatabase(serverId: string) {
        return this.prisma.server.findUnique({ where: { serverId } });
    }

    getModLogChannel(serverId: string) {
        return this.prisma.logChannel.findFirst({ where: { serverId, type: LogChannelType.MOD_ACTION_LOG } });
    }

    createFreshServerInDatabase(serverId: string) {
        return this.prisma.server.create({
            data: {
                serverId,
                locale: "en-US",
                premium: false,
                disabled: false,
                muteRoleId: null,
                botJoinedAt: null,
                filterEnabled: false,
                kickInfractionThreshold: 15,
                muteInfractionThreshold: 10,
                banInfractionThreshold: 30,
            },
        });
    }

    addAction({
        serverId,
        type,
        executorId,
        reason,
        targetId,
        expiresAt,
        infractionPoints,
    }: Pick<Action, "serverId" | "type" | "executorId" | "reason" | "targetId" | "expiresAt" | "infractionPoints">) {
        return this.prisma.action.create({
            data: {
                serverId,
                type,
                executorId,
                reason,
                targetId,
                createdAt: new Date(),
                updatedAt: null,
                infractionPoints,
                expiresAt,
            },
        });
    }

    populateActionMessage(id: number, channelId: string, messageId: string) {
        return this.prisma.action.update({ where: { id }, data: { logChannelId: channelId, logChannelMessage: messageId } });
    }

    async getMember(serverId: string, userId: string, cache = true, force = false) {
        if (!force) {
            const isCached = await this.cache.get(buildMemberKey(serverId, userId));
            if (isCached) return isCached;
        }

        return this.rest.router.getMember(serverId, userId).then((data) => {
            if (cache) void this.cache.set(buildMemberKey(serverId, userId), data.member);
            return data.member;
        });
    }
}

export const buildMemberKey = (serverId: string, memberId: string) => `member-${serverId}-${memberId}`;
