import { Currency, ServerMember } from "@prisma/client";
import { formatDate, Util } from "@yokilabs/bot";
import { nanoid } from "nanoid";

import type { TuxoClient } from "../Client";
import type { Server } from "../typings";

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
            .then((data) =>
                data
                    ? {
                          ...data,
                          getPrefix: () => data.prefix ?? this.client.prefix,
                          getTimezone: () => data.timezone ?? "America/New_York",
                          formatDateByTimezone: (date: Date) => formatDate(date, data.timezone ?? "America/New_York"),
                      }
                    : null
            );
    }

    createFreshServerInDatabase(serverId: string, data?: Record<string, any>) {
        return (
            Promise.all([
                this.client.prisma.server.create({
                    data: {
                        serverId,
                        locale: "en-US",
                        premium: null,
                        prefix: null,
                        ...data,
                    },
                }),
                // Default configuration
                this.client.prisma.currency.create({
                    data: {
                        id: nanoid(17),
                        serverId,
                        name: "Points",
                        tag: "point",
                        createdBy: null,
                    },
                }),
            ])
                // Only server is necessary
                .then(([server]) => server)
        );
    }

    getCurrencies(serverId: string) {
        return this.client.prisma.currency.findMany({ where: { serverId } });
    }

    async getCurrency(serverId: string, tag: string) {
        return (await this.getCurrencies(serverId)).find((x) => x.tag === tag);
    }

    createCurrency(serverId: string, tag: string, name: string, createdBy: string) {
        return this.client.prisma.currency.create({
            data: {
                id: nanoid(17),
                serverId,
                name,
                tag,
                createdBy,
                createdAt: new Date(),
            },
        });
    }

    deleteCurrency(currency: Currency) {
        return Promise.all([
            this.client.prisma.currency.delete({
                where: {
                    id: currency.id,
                },
            }),
        ]);
    }

    getServerMembers(serverId: string) {
        return this.client.prisma.serverMember.findMany({ where: { serverId } });
    }

    getServerMember(serverId: string, userId: string) {
        return this.getServerMembers(serverId).then((x) => x.find((x) => x.userId === userId));
    }

    createServerMember(serverId: string, userId: string, balance: Record<string, number>) {
        return this.client.prisma.serverMember.create({ data: { id: nanoid(17), serverId, userId, balance } });
    }

    // Currencies argument is for self-cleaning deleted currencies
    updateServerMember(member: ServerMember, balance: Record<string, number>, currencies: Currency[]) {
        const newBalance = {};

        // Combine gained value and old value
        for (const currency in balance) {
            // Ignore currencies that no longer exist
            if (!currencies.find((x) => x.id === currency)) continue;

            newBalance[currency] = member.balance ? member.balance[currency] + (balance[currency] ?? 0) : balance[currency];
        }

        return this.client.prisma.serverMember.update({
            where: {
                id: member.id,
            },
            data: {
                balance: newBalance,
            },
        });
    }

    // Currencies argument is for self-cleaning deleted currencies
    async updateServerMemberBalance(serverId: string, userId: string, balanceChanges: Record<string, number>, currencies: Currency[]) {
        const member = await this.getServerMember(serverId, userId);

        if (!member) return this.createServerMember(serverId, userId, balanceChanges);
        return this.updateServerMember(member, balanceChanges, currencies);
    }

    // ! note: This is unchecked. Need to check the balance and membership in a command.
    // Currencies argument is for self-cleaning deleted currencies
    updateServerMemberBankBalance(member: ServerMember, deposit: Record<string, number>, currencies: Currency[]) {
        const balance = member.balance! as Record<string, number>;
        const newBalance = {};
        const newBankBalance = {};

        // Combine gained value and old value
        for (const currency in balance) {
            // Ignore currencies that are no longer existing or 0 deposits
            if (!currencies.find((x) => x.id === currency)) continue;

            newBalance[currency] = balance[currency] - (deposit[currency] ?? 0);
            newBankBalance[currency] = member.bankBalance?.[currency] ? member.bankBalance[currency] + (deposit[currency] ?? 0) : deposit[currency];
        }

        return this.client.prisma.serverMember.update({
            where: {
                id: member.id,
            },
            data: {
                balance: newBalance,
                bankBalance: newBankBalance,
            },
        });
    }
}
