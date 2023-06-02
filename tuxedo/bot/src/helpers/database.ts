import { Util } from "@yokilabs/bot";

import type { TuxoClient } from "../Client";
import type { Server } from "../typings";
import { nanoid } from "nanoid";

export class DatabaseUtil extends Util<TuxoClient> {
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

    createCurrency(serverId: string, tag: string, name: string) {
        return this.client.prisma.currency.create({
            data: {
                id: nanoid(17),
                serverId,
                name,
                tag,
            },
        });
    }

    getCurrencies(serverId: string) {
        return this.client.prisma.currency.findMany({ where: { serverId } });
    }

    async getCurrency(serverId: string, tag: string) {
        return (await this.getCurrencies(serverId)).find((x) => x.tag === tag);
    }
}
