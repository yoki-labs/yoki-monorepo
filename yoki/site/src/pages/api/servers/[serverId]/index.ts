import { ResponseType, Server, Severity } from "@prisma/client";
import { timezones } from "@yokilabs/utils";
import { NextApiResponse } from "next";

import rest from "../../../../guilded";
import prisma from "../../../../prisma";
import createServerRoute, { channelExistsInServer } from "../../../../utils/route";

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

const availableSeverity = Object.keys(Severity);
const availableResponse = Object.keys(ResponseType);

const serverConfigRoute = createServerRoute({
    async PATCH(req, res, _session, server, _member) {
        // Type-check body
        const { body } = req;

        // ///// Body validity check
        // Prefix can be string or unset
        if (isUnsettablePropertyTypeInvalid(body.prefix, "string")) return getErrorResponse(res, "prefix", "null or string");
        // Timezones can be valid timezones or unset
        else if (isEnumPropertyInvalid(body.timezone, timezones)) return getErrorResponse(res, "timezone", "null or string");
        // Expect number between 2-100
        else if (isPropertyTypeInvalid(body.spamFrequency, "number") || body.spamFrequency < 2 || body.spamFrequency > 100)
            return getErrorResponse(res, "spamFrequency", "number between 2 and 100");
        else if (isPropertyTypeInvalid(body.spamMentionFrequency, "number") || body.spamMentionFrequency < 2 || body.spamMentionFrequency > 100)
            return getErrorResponse(res, "spamMentionFrequency", "number between 2 and 100");
        // Infractions can be negative in notes and whatever, but here it isn't allowed.
        else if (isPropertyTypeInvalid(body.spamInfractionPoints, "number") || body.spamInfractionPoints < 0 || body.spamInfractionPoints > 10000)
            return getErrorResponse(res, "spamInfractionPoints", "number between 0 and 10'000");
        else if (isPropertyTypeInvalid(body.linkInfractionPoints, "number") || body.linkInfractionPoints < 0 || body.linkInfractionPoints > 10000)
            return getErrorResponse(res, "linkInfractionPoints", "number between 0 and 10'000");
        // Enums
        else if (isEnumPropertyInvalid(body.linkSeverity, availableSeverity)) return getErrorResponse(res, "linkSeverity", "severity");
        else if (isEnumPropertyInvalid(body.antiRaidResponse, availableResponse)) return getErrorResponse(res, "antiRaidResponse", "response type");
        // Channels
        else if (!(await isChannelPropertyValid(body.appealChannelId))) return getErrorResponse(res, "appealChannelId", "null or channel");
        else if (!(await isChannelPropertyValid(body.antiRaidChallengeChannel))) return getErrorResponse(res, "antiRaidChallengeChannel", "null or channel");
        // Misc numbers
        else if (isPropertyTypeInvalid(body.antiRaidAgeFilter, "number") || body.antiRaidAgeFilter < MIN_ANTIRAID_TIME || body.antiRaidAgeFilter > MAX_ANTIRAID_TIME)
            return getErrorResponse(res, "antiRaidAgeFilter", "time between 10 minutes and 14 days");

        // Modules
        const data: Partial<Server> = {
            // Server config
            prefix: MAP_DEFAULT_PREFIXES.includes(body.prefix) ? null : body.prefix ?? server.prefix,
            timezone: MAP_DEFAULT_TIMEZONE.includes(body.timezone) ? null : body.timezone ?? server.timezone,
            // Spam
            spamFrequency: body.spamFrequency,
            spamMentionFrequency: body.spamMentionFrequency,
            // Infractions
            spamInfractionPoints: body.spamInfractionPoints,
            linkInfractionPoints: body.linkInfractionPoints,
            linkSeverity: MAP_DEFAULT_SEVERITY.includes(body.linkSeverity) ? null : body.linkSeverity ?? server.linkSeverity,
            // Channels
            appealChannelId: typeof body.appealChannelId === "undefined" ? server.appealChannelId : body.appealChannelId,
            antiRaidChallengeChannel: typeof body.antiRaidChallengeChannel === "undefined" ? server.antiRaidChallengeChannel : body.antiRaidChallengeChannel,
        };

        // Remove repetition
        for (const moduleProp of BOOLEAN_PROPERTIES) {
            if (isPropertyTypeInvalid(body[moduleProp], "boolean")) return getErrorResponse(res, moduleProp, "boolean");

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
});

const getErrorResponse = (res: NextApiResponse, name: string, type: string) => res.status(400).json({ error: true, message: `Invalid ${name}. Expected ${type}` });

type AllowedValues = "string" | "number" | "boolean" | "object";

// Can only be set; no default
function isPropertyTypeInvalid<T>(value: T, expectedType: AllowedValues) {
    const valueType = typeof value;

    return valueType !== "undefined" && valueType !== expectedType;
}

// Null is set back to default
const isUnsettablePropertyTypeInvalid = <T>(value: T, expectedType: AllowedValues) => value !== null && isPropertyTypeInvalid(value, expectedType);

const isEnumPropertyInvalid = <T extends string>(value: unknown, expectedValues: T[]) => value !== null && typeof value !== "undefined" && !expectedValues.includes(value as T);

const isChannelPropertyValid = async <T>(channelId: T) =>
    typeof channelId === "undefined" || channelId === null || (typeof channelId === "string" && channelExistsInServer(channelId));

export default serverConfigRoute;
