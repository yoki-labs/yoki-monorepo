import { Util } from "@yokilabs/bot";

import { TuxoClient } from "../Client";

export class BalanceUtil extends Util<TuxoClient> {
    // Record<`serverId:memberId:commandName`, date number>
    private _lastCommandUsage: Record<string, number> = {};

    getLastCommandUsage(serverId: string, memberId: string, commandName: string) {
        return this._lastCommandUsage[this.generateUsageKey(serverId, memberId, commandName)];
    }

    updateLastCommandUsage(serverId: string, memberId: string, commandName: string) {
        return (this._lastCommandUsage[this.generateUsageKey(serverId, memberId, commandName)] = Date.now());
    }

    generateUsageKey(serverId: string, memberId: string, commandName: string) {
        return `${serverId}:${memberId}:${commandName}`;
    }
}
