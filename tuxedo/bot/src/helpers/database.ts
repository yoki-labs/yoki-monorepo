import type { Server } from "@prisma/client";

import { Util } from "../../../../yoki-labs/bot/helpers/util";
import type Client from "../Client";

export class DatabaseUtil extends Util<Client> {
    getServer(serverId: string, createIfNotExists?: true): Promise<Server>;
    getServer(serverId: string, createIfNotExists: false): Promise<Server | null>;
    getServer(serverId: string, createIfNotExists = true) {
        return this.client.prisma.server
            .findUnique({ where: { serverId } })
            .then((server) => {
                if (!server && createIfNotExists) return this.createFreshServerInDatabase(serverId);
                return server ?? null;
            })
            .then((data) => (data ? { ...data, getPrefix: () => data.prefix ?? process.env.DEFAULT_PREFIX } : null));
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
