import { Util } from "@yokilabs/bot";

import type TuxedoClient from "../Client";
import type { Server } from "../typings";

export class DatabaseUtil extends Util<TuxedoClient> {
    getServer(serverId: string, createIfNotExists?: true): Promise<Server>;
    getServer(serverId: string, createIfNotExists: false): Promise<Server | null>;
    getServer(serverId: string, createIfNotExists = true): Promise<Server | null> {
        return this.client.prisma.server
            .findUnique({ where: { serverId } })
            .then((server) => {
                if (!server && createIfNotExists) return this.createFreshServerInDatabase(serverId);
                return server ?? null;
            })
            .then((data) => (data ? { ...data, getPrefix: () => data.prefix ?? this.client.prefix } : null));
    }

    createFreshServerInDatabase(serverId: string, data?: Record<string, any>) {
        return this.client.prisma.server.create({
            data: {
                serverId,
                locale: "en-US",
                premium: null,
                prefix: null,
                ...data,
            },
        });
    }
}
