import type { InviteFilter, Preset } from "@prisma/client";
import fetch from "node-fetch";

import type { PresetLink, Server } from "../typings";
import { Colors } from "../utils/color";
import { urlPresets } from "../utils/presets";
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

    readonly presets = urlPresets;

    async checkLinks({
        server,
        userId,
        channelId,
        content,
        filteredContent,
        presets,
        resultingAction,
    }: {
        server: Server;
        userId: string;
        channelId: string;
        content: string;
        filteredContent: FilteredContent;
        presets?: Preset[];
        resultingAction: () => unknown;
    }) {
        const greylistedUrls = server.filterEnabled ? await this.prisma.urlFilter.findMany({ where: { serverId: server.serverId } }) : null;
        const enabledPresets = presets ?? (await this.dbUtil.getEnabledLinkPresets(server.serverId));
        const whitelistedInvites = server.filterInvites ? await this.prisma.inviteFilter.findMany({ where: { serverId: server.serverId } }) : null;

        const presetLinks = enabledPresets.map((x) => this.presets[x.preset]).flat();
        const links = content.matchAll(this.urlRegex);

        for (const link of links) {
            const groups = link.groups! as { subdomain?: string; domain: string; route?: string };
            const { domain, subdomain, route } = groups;

            // Not .some, because severity and infraction points
            const greylistedUrl = greylistedUrls?.find((x) => x.domain === domain);

            // Bad URL
            // && ...:
            //   - exists(1) ^ whitelist(1) => 0
            //   - doesn't exist(0) ^ whitelist(1) => 1
            //   - exists(1) ^ blacklist(0) => 1
            //   - doesn't exist(0) ^ blacklist(0) => 0
            const badUrl = server.filterEnabled && Number(greylistedUrl !== undefined && greylistedUrl !== null) ^ Number(server.urlFilterIsWhitelist);

            if ((domain !== "guilded.gg" && badUrl) || presetLinks.some((x) => this.matchesPresetLink(x, groups)))
                return this.dealWithUser(
                    userId,
                    server,
                    channelId,
                    filteredContent,
                    resultingAction,
                    "URL filter tripped",
                    greylistedUrl?.infractionPoints ?? server.linkInfractionPoints,
                    greylistedUrl?.severity ?? server.linkSeverity,
                    domain
                );
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

                const response = await fetch(`https://www.guilded.gg/api/content/route/metadata?route=/i/${invite}`);

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

                const response = await fetch(`https://www.guilded.gg/api/content/route/metadata?route=/${vanity}`);

                // Don't care
                if (!response.ok) return;

                const json = await response.json();

                // Try getting it, but if it fails, then it will detect the fail regardless
                const targetServerId = (json as { metadata?: { team?: { id: string } } }).metadata?.team?.id;

                await this.checkServerId(server, userId, channelId, filteredContent, targetServerId, whitelistedInvites!, route, resultingAction);
            }
        }
    }

    matchesPresetLink(presetLink: PresetLink, { subdomain, domain, route }: { subdomain?: string; domain: string; route?: string }) {
        const matchesSubdomain = presetLink.subdomain === undefined || subdomain === presetLink.subdomain;
        const matchesRoute = presetLink.route === undefined || (route !== undefined && this.matchesRoute(route, presetLink.route));
        return domain === presetLink.domain && matchesSubdomain && matchesRoute;
    }

    matchesRoute(route: string, expectedRoute: string[]) {
        return (
            route
                .split("/")
                .slice(1, expectedRoute.length + 1)
                .join("/") === expectedRoute.join("/")
        );
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
        if (targetServerId && targetServerId !== server.serverId && !whitelisted.some((x) => x.targetServerId === targetServerId))
            return this.dealWithUser(userId, server, channelId, filteredContent, resultingAction, "Invite filter tripped", server.linkInfractionPoints, server.linkSeverity, route);
    }

    override onUserWarn(userId: string, _serv: Server, channelId: string | null, filteredContent: FilteredContent) {
        // When channels and messages get filtered
        if (filteredContent < FilteredContent.ChannelContent)
            return this.client.messageUtil.sendWarningBlock(
                channelId!,
                `Stop spamming`,
                `**Alert:** <@${userId}>, you have posted a blacklisted/non-whitelisted domain or invite in this server. This is a warning for you to not do it again, otherwise moderation actions may be taken against you.`,
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
                `**Alert:** <@${userId}>, you have been muted for posting a blacklisted/non-whitelisted domain or invite in this server.`,
                Colors.red,
                undefined,
                { isPrivate: true }
            );
        // TODO: DM user
        return 0;
    }
}
