import type { TeamMemberPayload } from "@guildedjs/guilded-api-typings";
import { nanoid } from "nanoid";
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
                referenceId: nanoid(17),
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
            if (cache) void this.cache.set(buildMemberKey(serverId, userId), data.member, { expire: 900 });
            return data.member;
        });
    }
}

export const buildMemberKey = (serverId: string, memberId: string) => `member-${serverId}-${memberId}`;
