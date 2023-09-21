import { Server, Severity } from "@prisma/client";
import { timezones } from "@yokilabs/utils";
import { NextApiResponse } from "next";

import prisma from "../../../../prisma";
import createServerRoute from "../../../../utils/route";

const DEFAULT_PREFIX = process.env.DEFAULT_PREFIX as string;
const MAP_DEFAULT_PREFIXES = [DEFAULT_PREFIX, null, ""];
const DEFAULT_TIMEZONE = "america/new_york";
const MAP_DEFAULT_TIMEZONE = [DEFAULT_TIMEZONE, null];
const MAP_DEFAULT_SEVERITY = [Severity.WARN, null];

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

const availableSeverity = Object.keys(Severity);

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
        // Severity
        else if (isEnumPropertyInvalid(body.linkSeverity, availableSeverity)) return getErrorResponse(res, "linkSeverity", "severity");

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
        };

        // Remove repetition
        for (const moduleProp of BOOLEAN_PROPERTIES) {
            if (isPropertyTypeInvalid(body[moduleProp], "boolean")) return getErrorResponse(res, moduleProp, "boolean");

            // It is fine
            data[moduleProp] = body[moduleProp];
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

export default serverConfigRoute;
