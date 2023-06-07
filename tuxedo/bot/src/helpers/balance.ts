import { Util } from "@yokilabs/bot";

import { TuxoClient } from "../Client";

export class BalanceUtil extends Util<TuxoClient> {
    // Record<`serverId:memberId:commandName`, date number>
    lastCommandUsage: Record<string, number> = {};

    getLastCommandUsage(serverId: string, memberId: string, commandName: string) {
        return this.lastCommandUsage[this.generateUsageKey(serverId, memberId, commandName)];
    }

    updateLastCommandUsage(serverId: string, memberId: string, commandName: string) {
        return (this.lastCommandUsage[this.generateUsageKey(serverId, memberId, commandName)] = Date.now());
    }

    generateUsageKey(serverId: string, memberId: string, commandName: string) {
        return `${serverId}:${memberId}:${commandName}`;
    }
}
