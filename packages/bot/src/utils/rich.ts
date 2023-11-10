import { Channel, Member, UserType } from "guilded.js";

import { RichMarkupChannelMention, RichMarkupEmote, RichMarkupMark, RichMarkupText, RichMarkupUserMention } from "./rich-types";

export const createUserMentionElement = (member: Member): RichMarkupUserMention => ({
    type: "mention",
    object: "inline",
    data: {
        mention: {
            type: "person",
            matcher: `${member.nickname ? `@${member.nickname}` : " "} @${member.username}`,
            name: member.displayName ?? "",
            id: member.id,
            nickname: Boolean(member.nickname),
            sortOrder: 0,
            mentionedUser: {
                id: member.id,
                userInfo: {
                    id: member.id,
                    name: member.username ?? "",
                    nickname: member.nickname ?? "",
                    profilePicture: member.user?.avatar ?? void 0,
                    type: member.user?.type === UserType.Bot ? "bot" : "user",
                },
            },
        },
    },
    nodes: [
        {
            object: "text",
            leaves: [
                {
                    object: "leaf",
                    text: `@${member.displayName}`,
                    marks: [],
                },
            ],
        },
    ],
});

export const createChannelMentionElement = (channel: Channel): RichMarkupChannelMention => ({
    type: "channel",
    object: "inline",
    data: {
        channel: {
            matcher: `#${channel.name}`,
            name: channel.name,
            id: channel.id,
        },
    },
    nodes: [
        {
            object: "text",
            leaves: [
                {
                    object: "leaf",
                    text: `#${channel.id}`,
                    marks: [],
                },
            ],
        },
    ],
});

export const createDefaultEmoteNode = (id: number, name: string): RichMarkupEmote => ({
    object: "inline",
    type: "reaction",
    data: {
        reaction: {
            id,
            customReactionId: id,
        },
    },
    nodes: [
        {
            object: "text",
            leaves: [
                {
                    object: "leaf",
                    text: `:${name}:`,
                    marks: [],
                },
            ],
        },
    ],
});

export const createEmoteNode = (id: number, name: string, serverId: string, url: string): RichMarkupEmote => ({
    object: "inline",
    type: "reaction",
    data: {
        reaction: {
            id,
            customReactionId: id,
            customReaction: {
                id,
                name,
                png: url,
                webp: url,
                apng: null,
                teamId: serverId,
            },
        },
    },
    nodes: [
        {
            object: "text",
            leaves: [
                {
                    object: "leaf",
                    text: `:${name}:`,
                    marks: [],
                },
            ],
        },
    ],
});

export const createTextElement = (text: string, marks: RichMarkupMark[] = []): RichMarkupText => ({
    object: "text",
    leaves: [
        {
            object: "leaf",
            text,
            marks,
        },
    ],
});

export const checkmarkEmoteNode = createEmoteNode(
    2119401,
    "YokiLabsCheckbox",
    "4R56dNkl",
    "https://img.guildedcdn.com/CustomReaction/ff4c6438f22d607b10847f6789c3d7a3-Full.webp?w=120&h=120"
);
export const crossmarkEmoteNode = createEmoteNode(
    2119402,
    "YokiLabsCrossbox",
    "4R56dNkl",
    "https://img.guildedcdn.com/CustomReaction/5a3b1072f550296eff57bbe96406d5f9-Full.webp?w=120&h=120"
);
export const exclamationmarkEmoteNode = createEmoteNode(
    2119403,
    "YokiLabsExclamationbox",
    "4R56dNkl",
    "https://img.guildedcdn.com/CustomReaction/62307461393ae8e5788aa0f40ebf9485-Full.webp?w=120&h=120"
);
