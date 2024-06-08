import { Preset, RoleType, Severity } from "@prisma/client";

import prisma from "../../../../../prisma";
import { createServerRoute } from "../../../../../utils/routes/servers";

const allowedPresets = ["profanity", "sexual", "slurs", "sexual-links"];
const allowedSeverities = Object.keys(Severity);

const serverPresetRoute = createServerRoute({
    requiredRoles: {
        POST: RoleType.ADMIN,
        PATCH: RoleType.ADMIN,
        DELETE: RoleType.ADMIN,
    },
    methods: {
        async POST(req, res, _session, { serverId }, _member) {
            const { preset } = req.query;

            // Check query
            if (!allowedPresets.includes(preset as string)) return res.status(400).json({ error: true, message: "Preset must be one of the allowed preset names." });

            const presets: Preset[] = await prisma.preset.findMany({
                where: {
                    serverId,
                },
            });

            // Can't enable it; it's enabled
            const existingPreset = presets.find((x) => x.preset === preset);
            if (existingPreset) return res.status(404).json({ error: true, message: "Preset already exists." });

            await prisma.preset.create({
                data: {
                    serverId,
                    preset: preset as string,
                },
            });

            return res.status(200).json({
                preset: {
                    serverId,
                    preset,
                    severity: null,
                    infractionPoints: null,
                },
            });
        },
        async PATCH(req, res, _session, { serverId }, _member) {
            const { preset } = req.query;

            // Check query
            if (!allowedPresets.includes(preset as string)) return res.status(400).json({ error: true, message: "Preset must be one of the allowed preset names." });

            // Type-check body
            const { severity, infractionPoints } = req.body;

            if (typeof infractionPoints !== "number" || infractionPoints < 0 || infractionPoints > 10000)
                return res.status(400).json({ error: true, message: "Expected infractionPoints to be number between 0 and 10'000." });
            else if (typeof severity !== "string" || !allowedSeverities.includes(severity))
                return res.status(400).json({ error: true, message: "Expected severity to be a severity type." });

            const presets: Preset[] = await prisma.preset.findMany({
                where: {
                    serverId,
                },
            });

            const existingPreset = presets.find((x) => x.preset === preset);

            if (!existingPreset) return res.status(404).json({ error: true, message: "No such preset found." });

            await prisma.preset.update({
                where: {
                    id: existingPreset.id,
                },
                data: {
                    infractionPoints,
                    severity: severity as Severity,
                },
            });

            return res.status(200).json({
                preset: {
                    serverId: existingPreset.serverId,
                    preset: existingPreset.preset,
                    severity,
                    infractionPoints,
                },
            });
        },
        async DELETE(req, res, _session, { serverId }, _member) {
            const { preset } = req.query;

            // Check query
            if (!allowedPresets.includes(preset as string)) return res.status(400).json({ error: true, message: "Preset must be one of the allowed preset names." });

            const presets: Preset[] = await prisma.preset.findMany({
                where: {
                    serverId,
                },
            });

            const existingPreset = presets.find((x) => x.preset === preset);

            if (!existingPreset) return res.status(404).json({ error: true, message: "No such preset found." });

            await prisma.preset.delete({
                where: {
                    id: existingPreset.id,
                },
            });

            return res.status(204);
        },
    },
});

export default serverPresetRoute;
