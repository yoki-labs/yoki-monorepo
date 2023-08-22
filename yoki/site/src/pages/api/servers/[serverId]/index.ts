import { Action, Role } from "@prisma/client";
import prisma from "../../../../prisma";
import createServerRoute from "../../../../utils/route";
import rest from "../../../../guilded";
import { allowedRoleTypes, roleExistsInServer } from "../../../../utils/roleUtil";
import { timezones } from "@yokilabs/utils";

const DEFAULT_PREFIX = process.env.DEFAULT_PREFIX as string;
const MAP_DEFAULT_PREFIXES = [DEFAULT_PREFIX, null, ""];
const DEFAULT_TIMEZONE = "america/new_york";
const MAP_DEFAULT_TIMEZONE = [DEFAULT_TIMEZONE, null];

const serverConfigRoute = createServerRoute({
    async PATCH(req, res, _session, { serverId, prefix: previousPrefix, timezone: previousTimezone }, _member) {
        // Type-check body
        const { prefix: prefixStr, timezone: timezoneStr } = req.body;

        // Allow nulls for unsetting
        if (prefixStr !== null && typeof prefixStr === "undefined" && typeof prefixStr !== "string")
            return res.status(400).json({ error: true, message: "Invalid prefix. Expected null or string" });
        else if (timezoneStr !== null && typeof timezoneStr !== "undefined" && !timezones.includes(timezoneStr))
            return res.status(400).json({ error: true, message: "Invalid timezone type. Expected null or string" });

        const prefix = MAP_DEFAULT_PREFIXES.includes(prefixStr) ? null : prefixStr ?? previousPrefix;
        const timezone = MAP_DEFAULT_TIMEZONE.includes(timezoneStr) ? null : timezoneStr ?? previousTimezone;

        await prisma.server.update({
            where: {
                serverId,
            },
            data: {
                prefix,
                timezone,
            }
        });

        return res.status(200).json({});
    },
});

export default serverConfigRoute;