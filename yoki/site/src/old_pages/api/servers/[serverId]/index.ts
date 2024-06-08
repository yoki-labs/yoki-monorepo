import { ResponseType, RoleType, Server, Severity } from "@prisma/client";
import { timezones } from "@yokilabs/utils";

import rest from "../../../../guilded";
import prisma from "../../../../prisma";
import {
    availableSeverityValues,
    getBodyErrorResponse,
    isBodyChannelPropertyValid,
    isBodyEnumPropertyInvalid,
    isBodyPropertyTypeInvalid,
    isRemovableBodyPropertyTypeInvalid,
} from "../../../../utils/routes/body";
import { createServerRoute } from "../../../../utils/routes/servers";

const DEFAULT_PREFIX = process.env.DEFAULT_PREFIX as string;
const MAP_DEFAULT_PREFIXES = [DEFAULT_PREFIX, null, ""];
const DEFAULT_TIMEZONE = "america/new_york";
const MAP_DEFAULT_TIMEZONE = [DEFAULT_TIMEZONE, null];
const MAP_DEFAULT_SEVERITY = [Severity.WARN, null];
const MIN_ANTIRAID_TIME = 10 * 60 * 1000;
const MAX_ANTIRAID_TIME = 14 * 24 * 60 * 60 * 1000;

const BOOLEAN_PROPERTIES: (keyof Server)[] = [
    // Modules Automod
    "filterEnabled",
    "filterInvites",
    "scanNSFW",
    "antiHoistEnabled",
    // Modules Server entry & support
    "modmailEnabled",
    "antiRaidEnabled",
    "appealsEnabled",
    // Other Boolean properties
    "filterOnMods",
    "urlFilterIsWhitelist",
];
const ROLE_PROPERTIES: (keyof Server)[] = ["muteRoleId", "memberRoleId", "modmailPingRoleId"];
const availableResponse = Object.keys(ResponseType);

const serverConfigRoute = createServerRoute({
    requiredRoles: {
        PATCH: RoleType.ADMIN,
    },
    methods: {
        async PATCH(req, res, _session, server, _member) {
            // Type-check body
            const { body } = req;

            // ///// Body validity check
            // Prefix can be string or unset
            if (isRemovableBodyPropertyTypeInvalid(body.prefix, "string")) return getBodyErrorResponse(res, "prefix", "null or string");
            // Timezones can be valid timezones or unset
            else if (isBodyEnumPropertyInvalid(body.timezone, timezones)) return getBodyErrorResponse(res, "timezone", "null or string");
            // Expect number between 2-100
            else if (isBodyPropertyTypeInvalid(body.spamFrequency, "number") || body.spamFrequency < 2 || body.spamFrequency > 100)
                return getBodyErrorResponse(res, "spamFrequency", "number between 2 and 100");
            else if (isBodyPropertyTypeInvalid(body.spamMentionFrequency, "number") || body.spamMentionFrequency < 2 || body.spamMentionFrequency > 100)
                return getBodyErrorResponse(res, "spamMentionFrequency", "number between 2 and 100");
            // Expect % (0>x>1)
            else if (isBodyPropertyTypeInvalid(body.nsfwHentaiConfidence, "number") || body.nsfwHentaiConfidence < 0 || body.nsfwHentaiConfidence > 1)
                return getBodyErrorResponse(res, "nsfwHentaiConfidence", "number between 0 and 1");
            else if (isBodyPropertyTypeInvalid(body.nsfwPornConfidence, "number") || body.nsfwPornConfidence < 0 || body.nsfwPornConfidence > 1)
                return getBodyErrorResponse(res, "nsfwPornConfidence", "number between 0 and 1");
            // Infractions can be negative in notes and whatever, but here it isn't allowed.
            else if (isBodyPropertyTypeInvalid(body.spamInfractionPoints, "number") || body.spamInfractionPoints < 0 || body.spamInfractionPoints > 10000)
                return getBodyErrorResponse(res, "spamInfractionPoints", "number between 0 and 10'000");
            else if (isBodyPropertyTypeInvalid(body.linkInfractionPoints, "number") || body.linkInfractionPoints < 0 || body.linkInfractionPoints > 10000)
                return getBodyErrorResponse(res, "linkInfractionPoints", "number between 0 and 10'000");
            // Enums
            else if (isBodyEnumPropertyInvalid(body.linkSeverity, availableSeverityValues)) return getBodyErrorResponse(res, "linkSeverity", "severity");
            else if (isBodyEnumPropertyInvalid(body.antiRaidResponse, availableResponse)) return getBodyErrorResponse(res, "antiRaidResponse", "response type");
            // Channels
            else if (!(await isBodyChannelPropertyValid(body.appealChannelId))) return getBodyErrorResponse(res, "appealChannelId", "null or channel");
            else if (!(await isBodyChannelPropertyValid(body.antiRaidChallengeChannel))) return getBodyErrorResponse(res, "antiRaidChallengeChannel", "null or channel");
            else if (!(await isBodyChannelPropertyValid(body.welcomeChannel))) return getBodyErrorResponse(res, "welcomeChannel", "null or channel");
            // Misc numbers
            else if (isBodyPropertyTypeInvalid(body.antiRaidAgeFilter, "number") || body.antiRaidAgeFilter < MIN_ANTIRAID_TIME || body.antiRaidAgeFilter > MAX_ANTIRAID_TIME)
                return getBodyErrorResponse(res, "antiRaidAgeFilter", "time between 10 minutes and 14 days");

            // Modules
            const data: Partial<Server> = {
                // Server config
                prefix: MAP_DEFAULT_PREFIXES.includes(body.prefix) ? null : body.prefix ?? server.prefix,
                timezone: MAP_DEFAULT_TIMEZONE.includes(body.timezone) ? null : body.timezone ?? server.timezone,
                // Spam & Filters
                urlFilterIsWhitelist: body.urlFilterIsWhitelist,
                spamFrequency: body.spamFrequency,
                spamMentionFrequency: body.spamMentionFrequency,
                nsfwHentaiConfidence: body.nsfwHentaiConfidence,
                nsfwPornConfidence: body.nsfwPornConfidence,
                // Anti-raid
                antiRaidAgeFilter: body.antiRaidAgeFilter,
                antiRaidResponse: body.antiRaidResponse,
                // Infractions
                spamInfractionPoints: body.spamInfractionPoints,
                linkInfractionPoints: body.linkInfractionPoints,
                linkSeverity: MAP_DEFAULT_SEVERITY.includes(body.linkSeverity) ? Severity.WARN : body.linkSeverity ?? server.linkSeverity,
                // Channels
                appealChannelId: typeof body.appealChannelId === "undefined" ? server.appealChannelId : body.appealChannelId,
                antiRaidChallengeChannel: typeof body.antiRaidChallengeChannel === "undefined" ? server.antiRaidChallengeChannel : body.antiRaidChallengeChannel,
                welcomeChannel: typeof body.welcomeChannel === "undefined" ? server.welcomeChannel : body.welcomeChannel,
            };

            // Remove repetition
            for (const moduleProp of BOOLEAN_PROPERTIES) {
                if (isBodyPropertyTypeInvalid(body[moduleProp], "boolean")) return getBodyErrorResponse(res, moduleProp, "boolean");

                // It is fine
                data[moduleProp] = body[moduleProp];
            }

            // Since it may not be necessary to fetch all the roles and all
            if (ROLE_PROPERTIES.some((x) => Object.hasOwn(body, x))) {
                const roleIds = (await rest.router.roles.roleReadMany({ serverId: server.serverId })).roles.map((x) => x.id);

                for (const roleProp of ROLE_PROPERTIES) {
                    const value = body[roleProp];

                    if (!(value === null || typeof value === "undefined" || (typeof value === "number" && roleIds.includes(value!))))
                        return res.status(400).json({ error: true, message: `Provided role from property ${roleProp} does not exist in the Guilded server.` });

                    // It is fine
                    data[roleProp] = value;
                }
            }

            await prisma.server.update({
                where: {
                    serverId: server.serverId,
                },
                data,
            });

            return res.status(200).json({});
        },
    },
});

export default serverConfigRoute;
