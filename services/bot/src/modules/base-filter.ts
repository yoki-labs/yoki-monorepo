import { Embed } from "@guildedjs/webhook-client";
import { Action, Severity } from "@prisma/client";
import { stripIndents } from "common-tags";

import { Util } from "../helpers/util";
import type { Server } from "../typings";
import type { FilteredContent } from "./content-filter";

export default abstract class BaseFilterUtil extends Util {
    onUserWarnBinded = this.onUserWarn.bind(this);

    // An object mapping the Action type -> Action punishment
    // Easy way for us to organize punishments into reusable code
    readonly severityAction: Record<
        Exclude<Severity, "NOTE">,
        (userId: string, server: Server, channelId: string | null, filteredContent: FilteredContent) => unknown | undefined
    > = {
        [Severity.BAN]: (userId, server) => {
            return this.rest.router.banMember(server.serverId, userId);
        },
        [Severity.KICK]: (userId, server) => {
            return this.rest.router.kickMember(server.serverId, userId);
        },
        [Severity.SOFTBAN]: async (userId, server) => {
            await this.rest.router.banMember(server.serverId, userId);
            return this.rest.router.unbanMember(server.serverId, userId);
        },
        [Severity.MUTE]: async (userId, server, channelId, filteredContent) => {
            if (server.muteRoleId) {
                await this.rest.router.assignRoleToMember(server.serverId, userId, server.muteRoleId);
                return this.onUserMute(userId, server, channelId, filteredContent);
            }
        },
        [Severity.WARN]: this.onUserWarnBinded,
    };

    async dealWithUser(
        userId: string,
        server: Server,
        channelId: string | null,
        filteredContent: FilteredContent,
        resultingAction: () => unknown,
        reason: string,
        infractionPoints: number,
        fallbackSeverity: Severity,
        triggerContent: string | null = null
    ) {
        if (!(await this.shouldFilterUser(server, userId))) return;

        try {
            // Perform resulting action, for message filtering it's deleting the original message
            await resultingAction();
        } catch (err: any) {
            if (err instanceof Error)
                await this.client.errorHandler.send("Error in base filter filtering callback", [new Embed().setDescription(stripIndents`${err.stack}`).setColor("RED")]);
        }

        const memberExceeds = await this.getMemberExceedsThreshold(server, userId, server.spamInfractionPoints);

        const actionType = memberExceeds || fallbackSeverity;

        await this.dbUtil.emitAction({
            type: actionType,
            reason: `[AUTOMOD] ${reason}.${memberExceeds ? `${actionType} threshold exceeded.` : ""}`,
            serverId: server.serverId,
            channelId,
            targetId: userId,
            executorId: this.client.userId!,
            infractionPoints,
            triggerContent,
            expiresAt: actionType === Severity.MUTE ? new Date(Date.now() + 1000 * 60 * 60 * 12) : null,
        });

        return this.severityAction[actionType](userId, server, channelId, filteredContent);
    }

    abstract onUserWarn(userId: string, server: Server, channelId: string | null, filteredContent: FilteredContent): Promise<unknown> | unknown;
    abstract onUserMute(userId: string, server: Server, channelId: string | null, filteredContent: FilteredContent): Promise<unknown> | unknown;

    // check if the amount of points incurred by this user is higher than the allowed threshold for this server
    ifExceedsInfractionThreshold(total: number, server: Server) {
        // FIXME: Still can be minimized further with a loop or something else
        // Check which threshold is exceeded if any
        const severity =
            server.banInfractionThreshold && total >= server.banInfractionThreshold
                ? Severity.BAN
                : server.softbanInfractionThreshold && total >= server.softbanInfractionThreshold
                ? Severity.SOFTBAN
                : server.kickInfractionThreshold && total >= server.kickInfractionThreshold
                ? Severity.KICK
                : server.muteInfractionThreshold && total >= server.muteInfractionThreshold
                ? Severity.MUTE
                : null;
        return severity;
    }

    async shouldFilterUser(server: Server, userId: string) {
        // By now, we assume the member has violated a filter or preset
        // Get the member from cache or API
        const member = await this.client.serverUtil.getMember(server.serverId, userId);

        // Don't moderate bots
        if (member.user.type === "bot") return false;

        // Get all the mod roles in this server
        const modRoles = await this.prisma.role.findMany({ where: { serverId: server.serverId } });

        // If the server doesn't have "filterOnMods" setting enabled and a mod violates the filter/preset, ignore
        if (!server.filterOnMods && modRoles.some((modRole) => member.roleIds.includes(modRole.roleId))) return false;

        return true;
    }

    async getMemberExceedsThreshold(server: Server, userId: string, infractionPoints: number) {
        // Total up all the infraction points from all these infractions
        const totalInfractionPoints = (await this.getMemberInfractionPoints(server.serverId, userId)) + infractionPoints;

        // Check whether this member exceeds the infraction threshold for this server
        return this.ifExceedsInfractionThreshold(totalInfractionPoints, server);
    }

    async getMemberInfractionPoints(serverId: string, userId: string) {
        // Get this member's past infraction history
        const pastActions = await this.dbUtil.getMemberHistory(serverId, userId);

        // Total up all the infraction points from all these infractions
        return BaseFilterUtil.totalAllInfractionPoints(pastActions);
    }

    // Total up all infraction points from an array of infractions
    static totalAllInfractionPoints(actions: Action[]) {
        return actions.reduce((prev, curr) => prev + curr.infractionPoints, 0);
    }
}
