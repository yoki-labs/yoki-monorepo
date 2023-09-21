import { ChannelIgnoreType, ContentIgnoreType, InviteFilter, Preset } from "@prisma/client";
import { Colors, isHashId } from "@yokilabs/utils";
import fetch from "node-fetch";

import type { PresetLink, Server } from "../typings";
import { URL_REGEX, UrlRegexGroups } from "../utils/matching";
import { urlPresets } from "../utils/presets";
import BaseFilterUtil from "./base-filter";
import { FilteredContent } from "./content-filter";

export class LinkFilterUtil extends BaseFilterUtil {
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
        contentType,
        presets,
        resultingAction,
    }: {
        server: Server;
        userId: string;
        channelId: string;
        content: string;
        // The same, might be able to merge
        filteredContent: FilteredContent;
        contentType: ContentIgnoreType;
        presets?: Preset[];
        resultingAction: () => unknown;
    }): Promise<boolean> {
        // Too many DB stuff to fetch to be honest
        const ignored = await this.client.prisma.channelIgnore.findMany({
            where: {
                serverId: server.serverId,
                OR: [
                    {
                        contentType,
                    },
                    {
                        channelId,
                    },
                ],
            },
        });

        const dontFilterUrls = !server.filterEnabled || ignored.find((x) => x.type === ChannelIgnoreType.URL);
        const dontFilterInvites = !server.filterInvites || ignored.find((x) => x.type === ChannelIgnoreType.INVITE);

        // ! ( (server.filterEnabled && !ignoredUrls) || (server.filterInvites && !ignoredInvites) )
        if (dontFilterUrls && dontFilterInvites) return false;

        // Server settings
        const greylistedUrls = dontFilterUrls ? null : await this.client.prisma.urlFilter.findMany({ where: { serverId: server.serverId } });
        const whitelistedInvites = dontFilterInvites ? null : await this.client.prisma.inviteFilter.findMany({ where: { serverId: server.serverId } });

        // To not re-fetch
        const enabledPresets = (presets ?? (await this.client.dbUtil.getEnabledPresets(server.serverId))).filter((x) => x.preset in this.presets);

        // If there are no blacklisted URLs, no presets enabled and invites shouldn't be filtered, there is no point in checking the links
        if (!(greylistedUrls?.length || server.urlFilterIsWhitelist || enabledPresets.length) && dontFilterInvites) return false;

        void this.client.amp.logEvent({
            event_type: "MESSAGE_LINKS_SCAN",
            user_id: userId,
            event_properties: { serverId: server.serverId },
        });

        const links = content.matchAll(URL_REGEX);
        for (const link of links) {
            // Matched link parts
            const groups = link.groups! as UrlRegexGroups;
            const domain = groups.full_domain ?? groups.routed_domain ?? groups.short_domain!;
            const subdomain = groups.full_subdomain ?? groups.routed_subdomain!;
            const route = groups.full_route ?? groups.routed_route!;
            // const { domain, subdomain, route } = groups;

            // Not .some, because severity and infraction points
            const greylistedUrl = greylistedUrls?.find((x) => x.domain === domain && (!x.subdomain || x.subdomain === subdomain) && (!x.route || x.route === route));
            const inPreset = enabledPresets.find((x) => this.presets[x.preset].some((y) => this.matchesPresetLink(y, subdomain, domain, route)));

            // Bad URL
            // && ...:
            //   - exists(1) ^ whitelist(1) => 0
            //   - doesn't exist(0) ^ whitelist(1) => 1
            //   - exists(1) ^ blacklist(0) => 1
            //   - doesn't exist(0) ^ blacklist(0) => 0
            const badUrl = server.filterEnabled && Number(greylistedUrl !== undefined && greylistedUrl !== null) ^ Number(server.urlFilterIsWhitelist);

            // Not guilded.gg, thing above (OR) is one of the preset items
            if (!dontFilterUrls && domain !== "guilded.gg" && (badUrl || inPreset)) {
                void this.client.amp.logEvent({ event_type: "MESSAGE_LINK_ACTION", user_id: userId, event_properties: { serverId: server.serverId } });
                await this.dealWithUser(
                    userId,
                    server,
                    channelId,
                    filteredContent,
                    resultingAction,
                    "URL filter tripped",
                    greylistedUrl?.infractionPoints ?? inPreset?.infractionPoints ?? server.linkInfractionPoints,
                    greylistedUrl?.severity ?? inPreset?.severity ?? server.linkSeverity,
                    domain
                );

                return false;
            }
            // No bad invites (filter invites enabled, it's guilded gg, route exists and it's none of Guilded's subdomains)
            // E.g., we don't need to filter support.guilded.gg/hc/en-us -- support. is there, which we can match
            if (dontFilterInvites || !(domain === "guilded.gg" && route && (subdomain === "www." || !subdomain))) return false;

            const breadCrumbs = route.split("/");

            // Specified by team ID
            if (route.startsWith("/teams/")) {
                // It will be something like ["", "teams", "ID-HERE", "channels", ...]
                // So we ignore those 2 and only up to 3rd one, yielding ["ID-HERE"]
                const teamId = breadCrumbs.slice(2, 3)[0];

                await this.checkServerId(server, userId, channelId, filteredContent, teamId, whitelistedInvites!, route, resultingAction);

                return false;
            }
            // Invite
            else if (route.startsWith("/i/")) {
                // Same as above condition
                const invite = breadCrumbs.splice(2, 3)[0];

                if (!isHashId(invite)) return false;

                const response = await fetch(`https://www.guilded.gg/api/content/route/metadata?route=/i/${invite}`);

                // Don't filter if it's bad
                if (!response.ok) return false;

                const json = await response.json();

                // Try getting it, but if it fails, then it will detect the fail regardless
                const targetServerId = (json as { metadata?: { inviteInfo?: { team: { id: string } } } }).metadata?.inviteInfo?.team.id;

                await this.checkServerId(server, userId, channelId, filteredContent, targetServerId, whitelistedInvites!, route, resultingAction);

                return true;
            }
            // Specified by vanity link
            else if (!this.nonServerRoutes.includes(breadCrumbs[1])) {
                const [, vanity] = breadCrumbs;

                // (It's not a vanity)
                if (!this.vanityRegex.test(vanity)) return false;

                const response = await fetch(`https://www.guilded.gg/api/content/route/metadata?route=/${vanity}`);

                // Don't filter if it's bad
                if (!response.ok) return false;

                const json = await response.json();

                // Try getting it, but if it fails, then it will detect the fail regardless
                const targetServerId = (json as { metadata?: { team?: { id: string } } }).metadata?.team?.id;

                await this.checkServerId(server, userId, channelId, filteredContent, targetServerId, whitelistedInvites!, route, resultingAction);

                return true;
            }
        }

        return false;
    }

    matchesPresetLink(presetLink: PresetLink, subdomain: string | undefined, domain: string, route: string | undefined) {
        // If preset has no subdomain, match it by other parts.
        // Otherwise, expect specific subdomain
        const matchesSubdomain = presetLink.subdomain === undefined || subdomain === presetLink.subdomain;
        // Expect given route to start with preset route if it's not null
        const matchesRoute = presetLink.route === undefined || (route !== undefined && this.matchesRoute(route, presetLink.route));

        return domain === presetLink.domain && matchesSubdomain && matchesRoute;
    }

    matchesRoute(route: string, expectedRoute: string[]) {
        // Let's say expected is ["a", "b"] and we get "/a/b/c/"
        // We split it by "/" and get ["", "a", "b", "c", ""]
        // We then ignore the first one (empty "") and get up to the amount of items in the expected route
        // That results in given route being ["a", "b"]
        // Both arrays are exactly the same, so we just need to compare them (which is done by joining here)
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
        if (targetServerId && targetServerId !== server.serverId && !whitelisted.some((x) => x.targetServerId === targetServerId)) {
            void this.client.amp.logEvent({ event_type: "MESSAGE_LINK_INVITE_ACTION", user_id: userId, event_properties: { serverId: server.serverId, route } });
            return this.dealWithUser(userId, server, channelId, filteredContent, resultingAction, "Invite filter tripped", server.linkInfractionPoints, server.linkSeverity, route);
        }
    }

    override onUserWarn(userId: string, _serv: Server, channelId: string | null, filteredContent: FilteredContent) {
        // When channels and messages get filtered
        if (filteredContent < FilteredContent.ChannelContent)
            return this.client.messageUtil.sendWarningBlock(
                channelId!,
                `Stop spamming`,
                `<@${userId}>, you have posted a blacklisted/non-whitelisted domain or invite in this server. This is a warning for you to not do it again, otherwise moderation actions may be taken against you.`,
                undefined,
                { isPrivate: true }
            );
        // TODO: DM user
        return 0;
    }

    override onUserMute(userId: string, _serv: Server, channelId: string | null, filteredContent: FilteredContent) {
        // When channels and messages get filtered
        if (filteredContent < FilteredContent.ChannelContent)
            return this.client.messageUtil.sendEmbed(
                channelId!,
                {
                    title: `:mute: You have been muted`,
                    description: `<@${userId}>, you have been muted for posting a blacklisted/non-whitelisted domain or invite in this server.`,
                    color: Colors.red,
                },
                { isPrivate: true }
            );
        // TODO: DM user
        return 0;
    }
}
