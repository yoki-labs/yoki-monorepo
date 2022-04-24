import { Action, Severity } from "../typings";
import { Scheduler } from "./Scheduler";

export class MuteScheduler extends Scheduler<Action> {
    readonly name = "mute";

    public async sweep(action: Action): Promise<void> {
        // get the server in the database
        const guild = await this.client.serverUtil.getServer(action.serverId, false);
        if (!guild) return void 0;

        // get the member from the server, cause if they're no longer a member then we don't want to run the role update
        const member = await this.client.serverUtil.getMember(action.serverId, action.targetId).catch(() => null);
        if (!member) return;

        // remove the mute role from the member
        if (guild.muteRoleId)
            void this.client.rest.router
                .removeRoleFromMember(action.serverId, action.targetId, guild.muteRoleId)
                .catch((e: Error) => console.log(`There was an error removing the mute (${action.id}) on ${member.user.name} (${member.user.id}). ${e.stack ?? e.message}`));
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

        console.log(`Sweeping mutes, ${expiredCases.length} case(s) found expired. ${expiredCases.length > 0 ? `IDS: ${expiredCases.map((x) => x.id).join(", ")}` : ""}`);
        // go through all expired cases
        for (const action of expiredCases) {
            // how long until the case expires in ms
            const timeout = new Date(action.expiresAt!).getTime() - Date.now();
            this.client.timeouts.set(
                action.id,
                setTimeout(() => this.sweep(action), timeout < 1 ? 10000 : timeout)
            );
        }

        // set all (impending) expired cases would be set to expired
        if (expiredCases) void this.client.prisma.action.updateMany({ data: { expired: true }, where: { id: { in: expiredCases.map((x) => x.id) } } });
    }
}
