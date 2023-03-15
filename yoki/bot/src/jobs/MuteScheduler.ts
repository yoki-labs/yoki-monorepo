import { Action, Severity } from "../typings";
import { Scheduler } from "./Scheduler";

/** scheduler that clears expired cases */
export class MuteScheduler extends Scheduler<Action> {
    readonly name = "mute";

    /** revert an expired case */
    public async sweep(action: Action): Promise<void> {
        // get the server in the database
        const guild = await this.client.dbUtil.getServer(action.serverId, false);
        if (!guild) return void 0;
        const member = await this.client.members.fetch(action.serverId, action.targetId).catch(() => null);
        if (!member) return;
        if (guild.muteRoleId) {
            await this.client.roles.removeRoleFromMember(action.serverId, action.targetId, guild.muteRoleId);
            if (action.channelId)
                await this.client.messageUtil.sendInfoBlock(action.channelId, "You have been unmuted", `<@${action.targetId}>, you have been automatically unmuted.`, undefined, {
                    isPrivate: true,
                });

            const userRoles = await this.client.prisma.roleState.findFirst({ where: { serverId: action.serverId, userId: action.targetId } });
            if (userRoles) await this.client.roleUtil.assignMultipleRoles(action.serverId, action.targetId, userRoles.roles);
        }
    }

    // sweeps for all impending expiring mutes and removes them
    public async sweeper(): Promise<void> {
        // get all mutes that expire between now and the time added with the check rate in ms
        const expiredCases = await this.client.prisma.action.findMany({
            where: {
                expired: false,
                type: Severity.MUTE,
                expiresAt: {
                    lt: new Date(Date.now() + this.checkRate * 1000),
                },
            },
        });

        if (!expiredCases.length) return console.log(`Did not find any mutes to sweep`);

        console.log(`Sweeping mutes, ${expiredCases.length} case(s) found expired. IDS: ${expiredCases.map((x) => x.id).join(", ")}`);
        // go through all expired cases
        for (const action of expiredCases) {
            void this.client.amp.logEvent({ event_type: "MUTE_EXPIRE", user_id: action.targetId, event_properties: { executorId: action.executorId } });
            // how long until the case expires in ms
            const timeout = new Date(action.expiresAt!).getTime() - Date.now();
            this.client.timeouts.set(
                action.id,
                setTimeout(
                    () => this.sweep(action).catch((e: Error) => console.log(`There was an error removing the mute (${action.id}). ${e.stack ?? e.message}`)),
                    timeout < 1 ? 10000 : timeout
                )
            );
        }
        const { count } = await this.client.prisma.action.updateMany({ data: { expired: true }, where: { id: { in: expiredCases.map((x) => x.id) } } });
        console.log(`Swept ${count} mutes`);
    }
}
