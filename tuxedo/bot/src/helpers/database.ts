import { Currency, DefaultIncomeType, IncomeCommand, MemberBalance, Reward, ServerMember } from "@prisma/client";
import { Util } from "@yokilabs/bot";
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
            });
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

    /**
     * Gets whether a module is enabled in a DB server.
     * @param server The server to check modules of
     * @param module The module to check in the server
     * @returns Whether the given module is enabled
     */
    hasEnabledModule(server: Server, module: number) {
        return Boolean(server.modules & module);
    }

    /**
     * Appends/enables a module to server's module list and returns the new list.
     * @param server The server to append module in
     * @param module The module to append in the server's enabled modules
     * @returns Server's new module enum with appended module
     */
    enableModule(server: Server, module: number) {
        return server.modules | module;
    }

    /**
     * Removes/disables a module from server's module list and returns the new list.
     * @param server The server to remove module from
     * @param module The module to remove from the server's enabled modules
     * @returns Server's new module enum without the provided module
     */
    disableModule(server: Server, module: number) {
        return server.modules & ~module;
    }

    getCurrencies(serverId: string) {
        return this.client.prisma.currency.findMany({ where: { serverId } });
    }

    async getCurrency(serverId: string, tag: string) {
        return (await this.getCurrencies(serverId)).find((x) => x.tag === tag);
    }

    createCurrency(serverId: string, tag: string, emote: string, name: string, createdBy: string) {
        return this.client.prisma.currency.create({
            data: {
                id: nanoid(17),
                serverId,
                name,
                emote,
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
            }),
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

    updateMemberBalance(
        serverId: string,
        userId: string,
        member: (ServerMember & { balances: MemberBalance[] }) | undefined,
        balanceChanges: Pick<MemberBalance, "currencyId" | "pocket" | "bank">[]
    ) {
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
        const balanceUpdate = member.balances.map((x) => ({
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
        }));

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

    async getIncomeOverride(serverId: string, incomeType: DefaultIncomeType | undefined, name: string) {
        return (await this.getIncomeOverrides(serverId)).find(incomeType ? (x) => x.incomeType === incomeType : (x) => x.name === name);
    }

    createOrUpdateIncome(
        serverId: string,
        createdBy: string,
        incomeType: DefaultIncomeType | undefined,
        name: string,
        override: IncomeCommand | undefined,
        changes: Partial<Omit<IncomeCommand, "id" | "serverId" | "incomeType" | "name" | "createdBy" | "createdAt">>
    ) {
        return override
            ? this.client.prisma.incomeCommand.update({
                  where: {
                      id: override.id,
                  },
                  data: changes,
              })
            : this.client.prisma.incomeCommand.create({
                  data: {
                      ...changes,
                      serverId,
                      incomeType,
                      name: incomeType ? undefined : name,
                      createdBy,
                  },
              });
    }

    createOrUpdateIncomeReward(
        serverId: string,
        createdBy: string,
        incomeType: DefaultIncomeType | undefined,
        name: string,
        override: (IncomeCommand & { rewards: Reward[] }) | undefined,
        newReward: Omit<Reward, "id" | "incomeCommandId">
    ) {
        return override
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
                  },
              });
    }

    updateIncomeRewards(override: IncomeCommand & { rewards: Reward[] }, newReward: Omit<Reward, "id" | "incomeCommandId">) {
        const existingReward = override.rewards.find((x) => x.currencyId === newReward.currencyId);

        return this.client.prisma.incomeCommand.update({
            where: {
                id: override.id,
            },
            data: {
                rewards: {
                    [existingReward ? "update" : "create"]: existingReward
                        ? {
                              where: {
                                  id: existingReward.id,
                              },
                              data: newReward,
                          }
                        : newReward,
                },
            },
        });
    }

    updateMemberBalanceOnly(member: ServerMember & { balances: MemberBalance[] }, balances: Pick<MemberBalance, "currencyId" | "pocket" | "bank">[]) {
        const balanceUpdate = member.balances.map((x) => {
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
            };
        });

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

    private _updateMemberBalance(member: ServerMember & { balances: MemberBalance[] }, balances: Pick<MemberBalance, "currencyId" | "pocket" | "bank">[]) {
        const balanceUpdate = member.balances.map((x) => {
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
            };
        });

        // Because someone might get currency they never had previously
        const createBalances = balances
            .filter((x) => !member.balances.find((y) => y.currencyId === x.currencyId))
            .map(({ currencyId, pocket, bank }) => ({
                serverId: member.serverId,
                currencyId,
                pocket,
                bank,
                all: pocket + bank,
            })) as Omit<MemberBalance, "id" | "memberId" | "member">[];

        return this.client.prisma.serverMember.update({
            where: {
                id: member.id,
            },
            data: {
                balances: {
                    update: balanceUpdate,
                    createMany: createBalances.length ? { data: createBalances } : undefined,
                },
            },
        });
    }
}
