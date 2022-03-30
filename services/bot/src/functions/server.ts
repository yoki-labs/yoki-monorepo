import { LogChannelType, Severity } from "@prisma/client";

import UtilClass from "./UtilClass";

export class ServerUtil extends UtilClass {
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
    }: {
        serverId: string;
        type: Severity;
        executorId: string;
        reason: string | null;
        targetId: string;
        expiresAt: Date | null;
    }) {
        return this.prisma.action.create({
            data: {
                serverId,
                type,
                executorId,
                reason,
                targetId,
                createdAt: new Date(),
                updatedAt: null,
                expiresAt,
            },
        });
    }

    populateActionMessage(id: number, channelId: string, messageId: string) {
        return this.prisma.action.update({ where: { id }, data: { logChannelId: channelId, logChannelMessage: messageId } });
    }
}
