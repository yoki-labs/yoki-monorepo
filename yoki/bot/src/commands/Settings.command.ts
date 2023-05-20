import { Colors } from "@yokilabs/bot";
import { Embed } from "guilded.js";

import { RoleType } from "../typings";
import { Category, Command } from "./commands";

const viewSettings = [
    {
        category: "General",
        properties: [
            ["id", "string"],
            ["prefix", "string"],
            ["locale", "string"],
            ["timezone", "string"],
        ],
    },
    {
        category: "Severity & Infractions",
        properties: [
            ["muteInfractionDuration", "string"],

            ["muteInfractionThreshold", "string"],
            ["kickInfractionThreshold", "string"],
            ["banInfractionThreshold", "string"],
            ["softbanInfractionThreshold", "string"],
            ["linkSeverity", "string"],
        ],
    },
    {
        category: "Antiraid & Appeals",
        properties: [
            ["antiRaidEnabled", "boolean"],
            ["antiRaidAgeFilter", "string"],
            ["antiRaidChallengeChannel", "string"],

            ["appealsEnabled", "boolean"],
            ["appealChannelId", "string"],
        ],
    },
    {
        category: "Modmail",
        properties: [
            ["modmailEnabled", "boolean"],
            ["modmailGroupId", "string"],
            ["modmailGroupCategoryId", "string"],
        ],
    },
    {
        category: "Roles",
        properties: [
            ["muteRoleId", "string"],
            ["memberRoleId", "string"],
        ],
    },
    {
        category: "Filters",
        properties: [
            ["filterEnabled", "boolean"],
            ["filterOnMods", "boolean"],
            ["filterInvites", "boolean"],

            ["spamFrequency", "string"],
            ["spamMentionFrequency", "string"],

            ["scanNSFW", "boolean"],
            ["antiHoistEnabled", "boolean"],
        ],
    },
] as const;

const Settings: Command = {
    name: "settings",
    description: "View the settings of this server",
    // usage: "",
    category: Category.Settings,
    requiredRole: RoleType.ADMIN,
    execute: (message, _args, ctx, commandCtx) => {
        const embed = new Embed();
        let description = "```csharp\n";

        for (const { category, properties } of viewSettings) {
            description += `// ${category} //\n`;
            // Each property
            for (const [propKey, type] of properties) {
                description += `[${propKey}]: `;

                // Write content based on its type
                if (type === "string") description += commandCtx.server[propKey] ? JSON.stringify(commandCtx.server[propKey]) : "unset";
                else if (type === "boolean") description += commandCtx.server[propKey] ? "🟢 enabled" : "🔴 disabled";

                description += "\n";
            }
            // Additional padding between categories
            description += "\n";
        }
        description += "```";

        embed.setTitle("Server settings code");
        embed.setColor(Colors.blockBackground);
        embed.setDescription(description);

        return ctx.messageUtil.send(message.channelId, embed);
    },
};

export default Settings;
