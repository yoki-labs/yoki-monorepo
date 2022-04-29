import Util from "./util.ts";
import { ContentFilter } from "../typings";

export class DatabaseUtil extends Util {
    addWordToFilter(data: Omit<ContentFilter, "id" | "createdAt">) {
        return this.prisma.contentFilter.create({ data });
    }

    removeWordFromFilter(serverId: string, content: string) {
        return this.prisma.contentFilter.deleteMany({ where: { serverId, content } });
    }

    getBannedWords(serverId: string) {
        return this.prisma.contentFilter.findMany({ where: { serverId } });
    }

    getMemberHistory(serverId: string, targetId: string) {
        return this.prisma.action.findMany({ where: { targetId, serverId } });
    }

    enableFilter(serverId: string) {
        return this.prisma.server.updateMany({ data: { filterEnabled: true }, where: { serverId } });
    }

    disableFilter(serverId: string) {
        return this.prisma.server.updateMany({ data: { filterEnabled: false }, where: { serverId } });
    }

    getEnabledPresets(serverId: string) {
        return this.prisma.preset.findMany({ where: { serverId } });
    }

    enablePreset(serverId: string, preset: string) {
        return this.prisma.preset.create({ data: { serverId, preset } });
    }

    disablePreset(serverId: string, preset: string) {
        return this.prisma.preset.deleteMany({ where: { serverId, preset } });
    }

    getMessage(channelId: string, messageId: string) {
        return this.prisma.message.findFirst({ where: { messageId, channelId } });
    }

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
}