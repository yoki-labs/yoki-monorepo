import { Action, Severity } from "@prisma/client";
import { Util } from "@yokilabs/bot";
import { UserType } from "guilded.js";

import type YokiClient from "../Client";
import type { Server } from "../typings";
import { errorLoggerS3 } from "../utils/s3";
import type { FilteredContent } from "./content-filter";

export default abstract class BaseFilterUtil<TFilterType = null> extends Util<YokiClient> {
    // An object mapping the Action type -> Action punishment
    // Easy way for us to organize punishments into reusable code
    readonly severityAction: Record<
        Exclude<Severity, "NOTE">,
        (userId: string, server: Server, channelId: string | null, filteredContent: FilteredContent, filterType: TFilterType | null) => unknown | undefined
    > = {
        [Severity.BAN]: (userId, server) => this.client.members.ban(server.serverId, userId),
        [Severity.KICK]: (userId, server) => this.client.members.kick(server.serverId, userId),
        [Severity.SOFTBAN]: async (userId, server) => {
            await this.client.members.ban(server.serverId, userId);
            return this.client.bans.unban(server.serverId, userId);
        },
        [Severity.MUTE]: async (userId, server, channelId, filteredContent, filterType) => {
            if (server.muteRoleId) {
                await this.client.roles.addRoleToMember(server.serverId, userId, server.muteRoleId);
                return this.onUserMute(userId, server, channelId, filteredContent, filterType);
            }

            // Since muting doesn't exist, just warn them instead
            return this.onUserWarn(userId, server, channelId, filteredContent, filterType);
        },
        [Severity.WARN]: this.onUserWarn.bind(this),
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
        triggerContent: string | null = null,
        filterType: TFilterType | null = null
    ) {
        if (!(await this.shouldFilterUser(server, userId))) return;

        try {
            // Perform resulting action, for message filtering it's deleting the original message
            await resultingAction();
        } catch (err: any) {
            if (err instanceof Error)
                await errorLoggerS3(this.client, "FILTER_RESULTING_ACTION", err, {
                    userId,
                    serverId: server.serverId,
                    channelId,
                    filteredContent,
                    resultingAction,
                    reason,
                    infractionPoints,
                    fallbackSeverity,
                    triggerContent,
                    filterType,
                });
        }

        const memberExceeds = await this.getMemberExceedsThreshold(server, userId, server.spamInfractionPoints);
        const actionType = memberExceeds ?? fallbackSeverity;

        await this.client.dbUtil.emitAction(
            {
                type: actionType,
                reason: `${reason}.${memberExceeds ? ` ${memberExceeds} threshold exceeded.` : ""}`,
                serverId: server.serverId,
                channelId,
                targetId: userId,
                executorId: this.client.user!.id,
                infractionPoints,
                triggerContent,
                pardoned: false,
                expiresAt:
                    actionType === Severity.MUTE ? new Date(server.muteInfractionDuration ? Date.now() + server.muteInfractionDuration : Date.now() + 1000 * 60 * 60 * 12) : null,
            },
            server
        );

        return this.severityAction[actionType](userId, server, channelId, filteredContent, filterType);
    }

    abstract onUserWarn(userId: string, server: Server, channelId: string | null, filteredContent: FilteredContent, filterType: TFilterType | null): Promise<unknown> | unknown;
    abstract onUserMute(userId: string, server: Server, channelId: string | null, filteredContent: FilteredContent, filterType: TFilterType | null): Promise<unknown> | unknown;

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
        const member = await this.client.members.fetch(server.serverId, userId);

        // Don't moderate bots
        if (member.user!.type === UserType.Bot) return false;

        // Get all the mod roles in this server
        const modRoles = await this.client.prisma.role.findMany({ where: { serverId: server.serverId } });

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
        const pastActions = await this.client.dbUtil.getMemberHistory(serverId, userId);

        // Total up all the infraction points from all these infractions
        return BaseFilterUtil.totalAllInfractionPoints(pastActions);
    }

    // Total up all infraction points from an array of infractions
    static totalAllInfractionPoints(actions: Action[]) {
        return actions.reduce((prev, curr) => prev + curr.infractionPoints, 0);
    }
}
