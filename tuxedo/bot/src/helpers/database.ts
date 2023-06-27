import { Currency, DefaultIncomeOverride, DefaultIncomeType, MemberBalance, Reward, ServerMember } from "@prisma/client";
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

    updateCurrency(currency: Currency, data: Partial<Omit<Currency, "id" | "serverId" | "createdAt" | "createdBy">>) {
        return this.client.prisma.currency.update({
            where: {
                id: currency.id,
            },
            data,
        });
    }

    getServerMembers(serverId: string) {
        return this.client.prisma.serverMember.findMany({ where: { serverId }, include: { balances: true } });
    }

    getServerMember(serverId: string, userId: string) {
        return this.getServerMembers(serverId).then((x) => x.find((x) => x.userId === userId));
    }

    private createMember(serverId: string, userId: string, balances: Pick<MemberBalance, "currencyId" | "pocket" | "bank">[]) {
        return this.client.prisma.serverMember.create({
            data: {
                id: nanoid(17),
                serverId,
                userId,
                balances: {
                    create: balances.map(({ currencyId, pocket, bank }) => ({
                        serverId,
                        currencyId,
                        pocket,
                        bank,
                        all: pocket + bank,
                    })),
                },
            },
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

    private _updateMemberBalance(member: ServerMember & { balances: MemberBalance[] }, balances: Pick<MemberBalance, "currencyId" | "pocket" | "bank">[]) {
        const balanceUpdate =
            member
                .balances
                .map((x) => {
                    const updated = balances.find((y) => y.currencyId === x.currencyId);

                    return {
                        where: {
                            id: x.id,
                        },
                        data: {
                            pocket: updated?.pocket ?? x.pocket,
                            bank: updated?.bank ?? x.bank,
                            all: (updated?.pocket ?? x.pocket) + (updated?.bank ?? x.bank),
                        },
                    }
                });

        // Because someone might get currency they never had previously
        const createBalances =
            balances
                .filter((x) => !member.balances.find((y) => y.currencyId === x.currencyId))
                .map(({ currencyId, pocket, bank }) =>
                    ({
                        serverId: member.serverId,
                        currencyId,
                        pocket,
                        bank,
                        all: pocket + bank,
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

    async updateMemberBalance(serverId: string, userId: string, member: (ServerMember & { balances: MemberBalance[] }) | undefined, balanceChanges: Pick<MemberBalance, "currencyId" | "pocket" | "bank">[]) {
        if (!member) return this.createMember(serverId, userId, balanceChanges);
        return this._updateMemberBalance(member, balanceChanges);
    }

    // async addToMemberBalance(serverId: string, userId: string, currencies: Currency[], balanceChanges: Record<string, number>) {
    //     const member = await this.getServerMember(serverId, userId);
    
    //     if (!member) return this.createMember(serverId, userId, currencies, balanceChanges);
    
    //     const newBalance = {};
    
    //     for (const balance of member.balances) {
    //         if (!(balance.currencyId in balanceChanges)) continue;
    
    //         newBalance[balance.currencyId] = balance.pocket + balanceChanges[balance.currencyId];
    //     }
    
    //     return this.updateMemberBalance(member, newBalance);
    // }    

    // async setMemberBalance(serverId: string, userId: string, currencies: Currency[], balance: Record<string, number>, bankBalance?: Record<string, number>) {
    //     const member = await this.getServerMember(serverId, userId);

    //     if (!member) return this.createMember(serverId, userId, currencies, balance, bankBalance);

    //     return this.updateMemberBalance(member, balance, bankBalance);
    // }

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

    async getIncomeOverride(serverId: string, incomeType: DefaultIncomeType) {
        return (await this.client.prisma.defaultIncomeOverride.findMany({ where: { serverId }, include: { rewards: true } })).find(x => x.incomeType === incomeType);
    }

    async createOrUpdateIncomeOverride(serverId: string, incomeType: DefaultIncomeType, override: DefaultIncomeOverride | undefined, cooldownMs: number) {
        return (
            override
            ? this.client.prisma.defaultIncomeOverride.update({
                where: {
                    id: override.id,
                },
                data: {
                    cooldownMs,
                },
            })
            : this.client.prisma.defaultIncomeOverride.create({
                data: {
                    serverId,
                    incomeType,
                    cooldownMs,
                }
            })
        );
    }
    
    createOrUpdateIncomeReward(serverId: string, incomeType: DefaultIncomeType, override: (DefaultIncomeOverride & { rewards: Reward[] }) | undefined, newReward: Omit<Reward, "id" | "incomeOverrideId">) {
        return (
            override
            ? this.updateIncomeRewards(override, newReward)
            : this.client.prisma.defaultIncomeOverride.create({
                data: {
                    serverId,
                    incomeType,
                    rewards: {
                        createMany: {
                            data: [newReward],
                        },
                    },
                }
            })
        );
    }

    updateIncomeRewards(override: (DefaultIncomeOverride & { rewards: Reward[] }), newReward: Omit<Reward, "id" | "incomeOverrideId">) {
        const existingReward = override.rewards.find(x => x.currencyId === newReward.currencyId);

        return this.client.prisma.defaultIncomeOverride.update({
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
