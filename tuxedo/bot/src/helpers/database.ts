import { Currency, IncomeCommand, DefaultIncomeType, MemberBalance, Reward, ServerMember } from "@prisma/client";
import { Util } from "@yokilabs/bot";
import { formatDate } from "@yokilabs/utils";
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
                        flags: ["EARLY_ACCESS"],
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
            this.client.prisma.memberBalance.deleteMany({
                where: {
                    serverId: currency.serverId,
                    currencyId: currency.id,
                },
            }),
            this.client.prisma.reward.deleteMany({
                where: {
                    serverId: currency.serverId,
                    currencyId: currency.id,
                },
            })
        ]);
    }

    getServerMembers(serverId: string) {
        return this.client.prisma.serverMember.findMany({ where: { serverId }, include: { balances: true } });
    }

    getServerMember(serverId: string, userId: string) {
        return this.getServerMembers(serverId).then((x) => x.find((x) => x.userId === userId));
    }

    createMember(serverId: string, userId: string, balance: Record<string, number>, bankBalance?: Record<string, number>) {
        return this.client.prisma.serverMember.create({
            data: {
                id: nanoid(17),
                serverId,
                userId,
                balances: {
                    create: Object.keys(balance).map(currencyId => ({
                        serverId,
                        currencyId,
                        pocket: balance[currencyId],
                        bank: bankBalance?.[currencyId] ?? 0,
                        all: balance[currencyId] + (bankBalance?.[currencyId] ?? 0),
                    }))
                }
            }
        });
    }

    // giveMemberCurrency(member: ServerMember & { balances: MemberBalance[] }, balance: Record<string, number>) {
    //     const balanceUpdate =
    //         member
    //             .balances
    //             .map((x) =>
    //                 ({
    //                     where: {
    //                         id: x.id,
    //                     },
    //                     data: {
    //                         pocket: x.pocket + (balance[x.currencyId] ?? 0),
    //                         all: x.bank + x.pocket + (balance[x.currencyId] ?? 0),
    //                     },
    //                 })
    //             );
    //     // Because someone might get currency they never had previously
    //     const createBalances =
    //         Object
    //             .keys(balance)
    //             .filter((x) => !member.balances.find((y) => y.currencyId === x))
    //             .map((x) =>
    //                 ({
    //                     serverId: member.serverId,
    //                     currencyId: x,
    //                     pocket: balance[x],
    //                     bank: 0,
    //                     all: balance[x],
    //                 })
    //             ) as Omit<MemberBalance, "id" | "memberId" | "member">[];

    //     return this.client.prisma.serverMember.update({
    //         where: {
    //             id: member.id,
    //         },
    //         data: {
    //             balances: {
    //                 update: balanceUpdate,
    //                 createMany: createBalances.length ? { data: createBalances } : undefined
    //             },
    //         },
    //     });
    // }

    updateMemberBalance(member: ServerMember & { balances: MemberBalance[] }, balance?: Record<string, number>, bankBalance?: Record<string, number>) {
        const balanceUpdate =
            member
                .balances
                .map((x) =>
                    ({
                        where: {
                            id: x.id,
                        },
                        data: {
                            pocket: balance?.[x.currencyId] ?? x.pocket,
                            bank: bankBalance?.[x.currencyId] ?? x.bank,
                            all: (balance?.[x.currencyId] ?? x.pocket) + (bankBalance?.[x.currencyId] ?? x.bank),
                        },
                    })
                );
        const currencyIds = [...new Set([...Object.keys(balance ?? {}), ...Object.keys(bankBalance ?? {})])];

        // Because someone might get currency they never had previously
        const createBalances =
            currencyIds
                .filter((x) => !member.balances.find((y) => y.currencyId === x))
                .map((x) =>
                    ({
                        serverId: member.serverId,
                        currencyId: x,
                        pocket: balance?.[x] ?? 0,
                        bank: bankBalance?.[x] ?? 0,
                        all: (balance?.[x] ?? 0) + (bankBalance?.[x] ?? 0),
                    })
                ) as Omit<MemberBalance, "id" | "memberId" | "member">[];

        return this.client.prisma.serverMember.update({
            where: {
                id: member.id,
            },
            data: {
                balances: {
                    update: balanceUpdate,
                    createMany: createBalances.length ? { data: createBalances } : undefined
                },
            },
        });
    }

    async addToMemberBalance(serverId: string, userId: string, balanceChanges: Record<string, number>) {
        const member = await this.getServerMember(serverId, userId);

        if (!member) return this.createMember(serverId, userId, balanceChanges);

        // Do not change and add to it instead
        const newBalance = {};

        for (const balance of member.balances) {
            if (!(balance.currencyId in balanceChanges)) continue;

            newBalance[balance.currencyId] = balance.pocket + balanceChanges[balance.currencyId];
        }

        return this.updateMemberBalance(member, newBalance);
    }

    async setMemberBalance(serverId: string, userId: string, balance: Record<string, number>, bankBalance?: Record<string, number>) {
        const member = await this.getServerMember(serverId, userId);

        if (!member) return this.createMember(serverId, userId, balance, bankBalance);

        return this.updateMemberBalance(member, balance, bankBalance);
    }

    // ! note: This is unchecked. Need to check the balance and membership in a command.
    depositMemberBalance(member: ServerMember & { balances: MemberBalance[] }, deposit: Record<string, number>) {
        const balanceUpdate =
            member
                .balances
                .map((x) =>
                    ({
                        where: {
                            id: x.id,
                        },
                        data: {
                            // We do not need to change `all`, because it would stay completely the same.
                            // We are not removing or giving person currency, we are just moving it elsewhere.
                            pocket: x.pocket - (deposit[x.currencyId] ?? 0),
                            bank: x.bank + (deposit[x.currencyId] ?? 0),
                            all: x.pocket + x.bank,
                        },
                    })
                );

        return this.client.prisma.serverMember.update({
            where: {
                id: member.id,
            },
            data: {
                balances: {
                    update: balanceUpdate,
                },
            },
        });
    }

    getIncomeOverrides(serverId: string) {
        return this.client.prisma.incomeCommand.findMany({ where: { serverId }, include: { rewards: true } });
    }

    async getIncomeOverrideByName(serverId: string, name: string) {
        return (await this.getIncomeOverrides(serverId)).find((x) => x.name === name);
    }

    async getIncomeOverrideByType(serverId: string, incomeType: DefaultIncomeType) {
        return (await this.getIncomeOverrides(serverId)).find((x) => x.name === incomeType);
    }

    async getIncomeOverride(serverId: string, incomeType: DefaultIncomeType | undefined, name: string) {
        return (await this.getIncomeOverrides(serverId)).find(incomeType ? (x) => x.incomeType === incomeType : (x) => x.name === name);
    }

    createOrUpdateIncome(serverId: string, createdBy: string, incomeType: DefaultIncomeType | undefined, name: string, override: IncomeCommand | undefined, cooldownMs: number) {
        return (
            override
            ? this.client.prisma.incomeCommand.update({
                where: {
                    id: override.id,
                },
                data: {
                    cooldownMs,
                },
            })
            : this.client.prisma.incomeCommand.create({
                data: {
                    serverId,
                    incomeType,
                    name: incomeType ? undefined : name,
                    cooldownMs,
                    createdBy,
                }
            })
        );
    }
    
    createOrUpdateIncomeReward(serverId: string, createdBy: string, incomeType: DefaultIncomeType | undefined, name: string, override: (IncomeCommand & { rewards: Reward[] }) | undefined, newReward: Omit<Reward, "id" | "incomeCommandId">) {
        return (
            override
            ? this.updateIncomeRewards(override, newReward)
            : this.client.prisma.incomeCommand.create({
                data: {
                    serverId,
                    incomeType,
                    name: incomeType ? undefined : name,
                    createdBy,
                    rewards: {
                        createMany: {
                            data: [newReward],
                        },
                    },
                }
            })
        );
    }

    updateIncomeRewards(override: (IncomeCommand & { rewards: Reward[] }), newReward: Omit<Reward, "id" | "incomeCommandId">) {
        const existingReward = override.rewards.find(x => x.currencyId === newReward.currencyId);

        return this.client.prisma.incomeCommand.update({
            where: {
                id: override.id,
            },
            data: {
                rewards: {
                    [existingReward ? "update" : "create"]:
                        existingReward
                        ? {
                            where: {
                                id: existingReward.id,
                            },
                            data: newReward,
                        }
                        : newReward,
                }
            },
        })
    }
}
