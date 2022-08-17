import type { InviteFilter } from "@prisma/client";
import { captureException } from "@sentry/node";
import fetch from "node-fetch";

import type { Server } from "../typings";
import { Colors } from "../utils/color";
import { isHashId } from "../utils/util";
import BaseFilterUtil from "./base-filter";
import { FilteredContent } from "./content-filter";

export class LinkFilterUtil extends BaseFilterUtil {
    readonly urlRegex =
        /(?:(?:[A-Za-z]+)?:\/{2,3})?(?<subdomain>(?:[^!@#$%^&*()?<>.,~`'":;\\\/|\s()\[\]]+[.])+)?(?<domain>[^!@#$%^&*()?<>.,~`'":;\\\/|\s()\[\]]+\.[^!@#$%^&*()?<>.,~`'":;\\\/|\s()\[\]]+)(?<route>(?:[/][^\s?#&\/()\[\]]+)+)?[/]?/g;

    readonly vanityRegex = /^[A-Za-z0-9\-]+$/;

    readonly nonServerRoutes = [
        "api",
        "i",
        "u",
        "r",
        "partners",
        "verify",
        "jobs",
        "teams",
        "channels",
        "docs",
        "tournaments",
        "profile",
        "chat",
        "blog",
        "find",
        "explore",
        "browse",
        "matchmaking",
    ];

    async checkLinks({
        server,
        userId,
        channelId,
        content,
        filteredContent,
        resultingAction,
    }: {
        server: Server;
        userId: string;
        channelId: string;
        content: string;
        filteredContent: FilteredContent;
        resultingAction: () => unknown;
    }) {
        const blacklistedUrls = server.filterEnabled ? await this.prisma.urlFilter.findMany({ where: { serverId: server.serverId } }) : null;
        const whitelistedInvites = server.filterInvites ? await this.prisma.inviteFilter.findMany({ where: { serverId: server.serverId } }) : null;

        const links = content.matchAll(this.urlRegex);

        for (const link of links) {
            const { subdomain, domain, route } = link.groups!;

            // Bad URLs
            if (server.filterEnabled && blacklistedUrls!.some((x) => x.domain === domain)) {
                try {
                    // Perform resulting action, for message filtering it's deleting the original message
                    await resultingAction();
                } catch (e) {
                    captureException(e);
                }

                return this.dealWithUser(userId, server, channelId, filteredContent, "URL filter tripped", domain);
            }
            // No bad invites (filter invites enabled, it's guilded gg, route exists and it's none of Guilded's subdomains)
            else if (!(server.filterInvites && domain === "guilded.gg" && route && (subdomain === "www." || !subdomain))) return;

            const breadCrumbs = route.split("/");

            // Specified by team ID
            if (route.startsWith("/teams/")) {
                const teamId = breadCrumbs.slice(2, 3)[0];

                await this.checkServerId(server, userId, channelId, filteredContent, teamId, whitelistedInvites!, route, resultingAction);
            }
            // Invite
            else if (route.startsWith("/i/")) {
                const invite = breadCrumbs.splice(2, 3)[0];

                if (!isHashId(invite)) return;

                const response = await fetch(`https://guilded.gg/api/content/route/metadata?route=%2Fi%2F${invite}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                // Don't care
                if (!response.ok) return;

                const json = await response.json();

                // Try getting it, but if it fails, then it will detect the fail regardless
                const targetServerId = (json as { metadata?: { inviteInfo?: { team: { id: string } } } }).metadata?.inviteInfo?.team.id;

                await this.checkServerId(server, userId, channelId, filteredContent, targetServerId, whitelistedInvites!, route, resultingAction);
            }
            // Specified by vanity link
            else if (!this.nonServerRoutes.includes(breadCrumbs[1])) {
                const [, vanity] = breadCrumbs;

                // (It's not a vanity)
                if (!this.vanityRegex.test(vanity)) return;

                const url = `https://guilded.gg/api/content/route/metadata?route=%2F${vanity}`;

                const response = await fetch(url, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                // Don't care
                if (!response.ok) return;

                const json = await response.json();

                // Try getting it, but if it fails, then it will detect the fail regardless
                const targetServerId = (json as { metadata?: { team?: { id: string } } }).metadata?.team?.id;

                await this.checkServerId(server, userId, channelId, filteredContent, targetServerId, whitelistedInvites!, route, resultingAction);
            }
        }
    }

    async checkServerId(
        server: Server,
        userId: string,
        channelId: string,
        filteredContent: FilteredContent,
        targetServerId: string | undefined,
        whitelisted: InviteFilter[],
        route: string,
        resultingAction: () => unknown
    ) {
        // Detect non-whitelisted server IDs and non-this-server ID
        if (targetServerId && targetServerId !== server.serverId && !whitelisted.some((x) => x.targetServerId === targetServerId)) {
            // Perform resulting action, for message filtering it's deleting the original message
            await resultingAction();
            return this.dealWithUser(userId, server, channelId, filteredContent, "Invite filter tripped", route);
        }
    }

    override onUserWarn(userId: string, _serv: Server, channelId: string | null, filteredContent: FilteredContent) {
        // When channels and messages get filtered
        if (filteredContent < FilteredContent.ChannelContent)
            return this.client.messageUtil.sendWarningBlock(
                channelId!,
                `Stop spamming`,
                `**Alert:** <@${userId}>, you have posted a blacklisted domain or non-whitelisted invite to a server. This is a warning for you to not do it again, otherwise moderation actions may be taken against you.`,
                undefined,
                { isPrivate: true }
            );
        // TODO: DM user
        return 0;
    }

    override onUserMute(userId: string, _serv: Server, channelId: string | null, filteredContent: FilteredContent) {
        // When channels and messages get filtered
        if (filteredContent < FilteredContent.ChannelContent)
            return this.client.messageUtil.sendValueBlock(
                channelId!,
                `:mute: You have been muted`,
                `**Alert:** <@${userId}>, you have been muted for posting a blacklisted domain or non-whitelisted invite to a server.`,
                Colors.red,
                undefined,
                { isPrivate: true }
            );
        // TODO: DM user
        return 0;
    }
}
