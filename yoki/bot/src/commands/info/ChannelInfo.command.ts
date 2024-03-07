import { channelName, ChannelRolePermission, channelTypeToDisplay, channelTypeToGreyIcon, ChannelUserPermission, inlineCode, inlineQuote, Permission } from "@yokilabs/bot";
import { Colors } from "@yokilabs/utils";
import { stripIndents } from "common-tags";
import { Channel, ChannelType, Embed, EmbedField, Member } from "guilded.js";

import YokiClient from "../../Client";
import { Category, Command } from "../commands";

const channelTypeToPermission: Record<ChannelType, Permission> = {
    [ChannelType.Announcements]: "CanReadAnnouncements",
    [ChannelType.Calendar]: "CanReadEvents",
    [ChannelType.Chat]: "CanReadChats",
    [ChannelType.Docs]: "CanReadDocs",
    [ChannelType.Forums]: "CanReadForums",
    [ChannelType.List]: "CanReadListItems",
    [ChannelType.Media]: "CanReadMedia",
    [ChannelType.Scheduling]: "CanReadSchedules",
    [ChannelType.Stream]: "CanReadStreams",
    [ChannelType.Voice]: "CanListenVoice",
};

const ChannelInfo: Command = {
    name: "channelinfo",
    description: "View information about the specified or current channel.",
    category: Category.Info,
    aliases: ["channeli", "ci"],
    args: [
        {
            name: "channel",
            type: "channel",
            optional: true,
        },
    ],
    execute: async (message, args, ctx, { server, member }) => {
        const channel = (args.channel as Channel | null) ?? (await ctx.channels.fetch(message.channelId));

        // No way to get membership
        if (message.groupId !== channel.groupId)
            return ctx.messageUtil.replyWithError(
                message,
                "Wrong group",
                `As of now, Yoki cannot check the group membership status of particular users or roles. As such, you can only get info of channels within the same group.`
            );
        // Make sure the channel can be viewed by the member
        else if (!((await memberHasRoleChannelPermissions(ctx, channel, member)) || (await memberHasUserChannelPermissions(ctx, channel, member))))
            return ctx.messageUtil.replyWithUnpermitted(message, `You do not have permission to view this channel.`);

        return ctx.messageUtil.send(message.channelId, {
            embeds: [
                new Embed()
                    .setTitle(channelName(channel.name, channel.serverId, channel.groupId, channel.id, (channel.raw as { id: string; type: string }).type))
                    .setColor(Colors.blockBackground)
                    .setAuthor(`${channelTypeToDisplay[channel.type]}`, channelTypeToGreyIcon[channel.type])
                    .setDescription(`Information about the provided channel ${inlineQuote(channel.name)}.`)
                    .addFields(
                        [
                            // Show neighbouring roles
                            channel.topic && {
                                name: "Topic",
                                value: channel.topic,
                            },
                            {
                                name: "Additional Info",
                                value: stripIndents`
                                    **Channel ID:** ${inlineCode(channel.id)}${channel.archivedAt ? `\n:file_cabinet: **Is archived.**` : ""}${
                                    (channel.raw as { visibility?: "public" }).visibility === "public" ? `\n:earth_americas: **Is public.**\n` : ""
                                }
                                    **Created at:** ${server.formatTimezone(new Date(channel.createdAt))}
                                    **Created by:** <@${channel.createdBy}>
                                `,
                            },
                        ].filter(Boolean) as EmbedField[]
                    )
                    .toJSON(),
            ],
            isSilent: true,
        });
    },
};

async function memberHasUserChannelPermissions(ctx: YokiClient, channel: Channel, member: Member) {
    const userPermissions = await ctx.rest
        .get(`/servers/${channel.serverId}/channels/${channel.id}/permissions/users/${member.id}`)
        .then((response) => response.channelUserPermission as ChannelUserPermission)
        .catch(() => null);

    return userPermissions?.permissions[channelTypeToPermission[channel.type]] ?? false;
}

async function memberHasRoleChannelPermissions(ctx: YokiClient, channel: Channel, member: Member) {
    const relevantPermission = channelTypeToPermission[channel.type];

    const serverRoles = await ctx.roles.fetchMany(channel.serverId);

    // Need base role
    const baseRoleId = serverRoles.find((x) => x.isBase)!.id;

    const rolePermissions = await ctx.rest
        .get(`/servers/${channel.serverId}/channels/${channel.id}/permissions/roles`)
        .then((response) => response.channelRolePermissions as ChannelRolePermission[])
        .catch(() => null);

    // There was an error while getting permissions, ignore it
    if (!rolePermissions) return false;

    // First role permission should be base role permission
    const baseRolePermissions = rolePermissions.find((x) => x.roleId === baseRoleId);

    // Whether a base role or one of the user's roles has permission to view the channel
    const heldRolePermissions = rolePermissions.filter((x) => member.roleIds.includes(x.roleId));
    const oneOfEnabled = baseRolePermissions?.permissions[relevantPermission] || heldRolePermissions.some((x) => x.permissions[relevantPermission]);

    // Either one of the user's roles has permission enabled or there are none disabled and user has server-level permissions to do so
    return (
        oneOfEnabled ||
        (typeof baseRolePermissions?.permissions[relevantPermission] !== "boolean" &&
            !heldRolePermissions.some((x) => typeof x.permissions[relevantPermission] === "boolean") &&
            serverRoles.filter((x) => x.isBase || member.roleIds[x.id]).some((x) => x.permissions.includes(relevantPermission)))
    );
}

export default ChannelInfo;
