import { RoleType } from "@prisma/client";
import { Colors } from "@yokilabs/utils";
import { Embed } from "guilded.js";

import { Category, Command } from "./commands";

const viewSettings = [
    {
        category: "General",
        properties: [
            ["id", "json"],
            ["prefix", "json"],
            ["locale", "json"],
            ["timezone", "json"],
        ],
    },
    {
        category: "Preferences",
        properties: [["modulesDisabled", "json"]],
    },
    {
        category: "Incomes",
        properties: [
            ["disableDefaultIncomes", "json"],
            ["sellCut", "json"],
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
                if (type === "json") description += commandCtx.server[propKey] ? JSON.stringify(commandCtx.server[propKey]) : "unset";
                // else if (type === "boolean") description += commandCtx.server[propKey] ? "🟢 enabled" : "🔴 disabled";

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
