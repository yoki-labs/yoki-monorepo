import { inlineCode, inlineQuote } from "@yokilabs/bot";
import { Colors } from "@yokilabs/utils";
import { stripIndents } from "common-tags";
import { Embed, EmbedField, Role } from "guilded.js";

import { Category, Command } from "../commands";

const RoleInfo: Command = {
    name: "roleinfo",
    description: "View information about the specified role.",
    category: Category.Info,
    aliases: ["rolei", "ri"],
    args: [
        {
            name: "role",
            type: "role",
        },
    ],
    execute: async (message, args, ctx, { server }) => {
        const role = args.role as Role;
        const roleId = role.id;

        // Get all the roles to display neighbouring roles
        const serverRoles = (await ctx.rest.get(`/servers/${message.serverId!}/roles`)).roles as Role[];
        const currentRoleIndex = serverRoles.findIndex((x) => x.id === role.id);

        // The role with the provided ID might not exist
        if (currentRoleIndex < 0) return ctx.messageUtil.replyWithError(message, `Role doesn't exist`, `The provided role does not exist.`);

        const currentRole = serverRoles[currentRoleIndex];

        return ctx.messageUtil.send(message.channelId, {
            embeds: [
                new Embed()
                    .setTitle(`${currentRole.isBase ? ":bust_in_silhouette: " : ""}<@${roleId}> (${inlineCode(roleId)})`)
                    .setColor(Colors.blockBackground)
                    .setDescription(`Info about the provided role with the name ${inlineQuote(currentRole.name)}.`)
                    .addFields(
                        [
                            // Show neighbouring roles
                            {
                                name: "Position",
                                value: stripIndents`
                                    ...
                                    ${[
                                        displayRoleInList(serverRoles[currentRoleIndex + 1]),
                                        displayRoleInList(currentRole, true),
                                        displayRoleInList(serverRoles[currentRoleIndex - 1]),
                                    ]
                                        .filter(Boolean)
                                        .join("\n")}
                                    ...
                                `,
                            },
                            {
                                name: "Role settings",
                                value: stripIndents`
                                    ${[
                                        currentRole.isMentionable && ":bell: **Is mentionable.**",
                                        currentRole.isDisplayedSeparately && ":pushpin: **Is displayed separately.**",
                                        currentRole.isSelfAssignable && ":label: **Is self assignable.**",
                                    ]
                                        .filter(Boolean)
                                        .join("\n")}

                                    ${displayRoleList(currentRole)}
                                `,
                            },
                            {
                                name: "Additional Info",
                                value: stripIndents`
                                    ${currentRole.isBase ? ":bust_in_silhouette: **Is member role.**" : ""}
                                    ${currentRole.colors ? `**Colors:** ${currentRole.colors.map(hexColor).join(" - ")}` : "**No color.**"}
                                    **Role created:** ${server.formatTimezone(new Date(currentRole.createdAt))} EST
                                    ${currentRole.updatedAt && `**Last updated:** ${server.formatTimezone(new Date(currentRole.updatedAt))} EST`}
                                `,
                            },
                        ].filter(Boolean) as EmbedField[]
                    )
                    .setThumbnail(currentRole.icon ?? undefined)
                    .toJSON(),
            ],
            isSilent: true,
        });
    },
};

function displayRoleInList(role?: Role, isCurrent?: boolean) {
    const formatting = isCurrent ? "**" : "";

    return role && `${formatting}${role.position}.${formatting} <@${role.id}> (${inlineCode(role.id)})`;
}

const displayRoleList = ({ isMentionable, isDisplayedSeparately, isSelfAssignable, permissions }: Role) =>
    `${isMentionable || isDisplayedSeparately || isSelfAssignable ? "... And " : ""}**${permissions.length}** permissions.`;

const hexColor = (value: number) => {
    const hex = value.toString(16);

    let deadSpace = "";
    const necessarySpace = 6 - hex.length;

    for (let i = 0; i < necessarySpace; i++) deadSpace += "0";

    return inlineCode(`#${hex}${deadSpace}`);
};

export default RoleInfo;
