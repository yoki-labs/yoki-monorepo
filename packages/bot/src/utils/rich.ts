import { Channel, Member, Role, UserType } from "guilded.js";

import {
    RichMarkupChannelMention,
    RichMarkupEmote,
    RichMarkupInlineElement,
    RichMarkupLeaf,
    RichMarkupMark,
    RichMarkupParagraph,
    RichMarkupRoleMention,
    RichMarkupText,
    RichMarkupUserMention,
} from "./rich-types";

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

export const createRoleMentionElement = (role: Role, sortOrder = 0): RichMarkupRoleMention => ({
    type: "mention",
    object: "inline",
    data: {
        mention: {
            type: "role",
            matcher: `@${role.name.toLowerCase()}`,
            name: role.name,
            id: role.id,
            color: role.colors?.length ? `#${role.colors[0].toString(16)}` : `#a3a3ac`,
            color2: (role.colors?.length ?? 0) > 1 ? `#${role.colors[1].toString(16)}` : undefined,
            sortOrder,
        },
    },
    nodes: [
        {
            object: "text",
            leaves: [
                {
                    object: "leaf",
                    text: `@${role.name}`,
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

export const createEmoteNode = (id: number, name: string): RichMarkupEmote => ({
    object: "inline",
    type: "reaction",
    data: {
        reaction: {
            id,
            customReactionId: id,
            // customReaction: {
            //     id,
            //     name,
            //     png: url,
            //     webp: url,
            //     apng: null,
            //     teamId: serverId,
            // },
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

export const createParagraph = (nodes: Array<RichMarkupText | RichMarkupInlineElement>): RichMarkupParagraph => ({
    object: "block",
    type: "paragraph",
    data: {},
    nodes,
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

export const createLeaf = (text: string, marks: RichMarkupMark[] = []): RichMarkupLeaf => ({
    object: "leaf",
    text,
    marks,
});

export const emptyText = createTextElement("");
export const checkmarkEmoteNode = createEmoteNode(
    2119401,
    "YokiLabsCheckbox"
    // "4R56dNkl",
    // "https://img2.guildedcdn.com/CustomReaction/ff4c6438f22d607b10847f6789c3d7a3-Full.webp?w=120&h=120"
);
export const crossmarkEmoteNode = createEmoteNode(
    2163778,
    "YokiLabsCrossbox"
    // "4R56dNkl",
    // "https://img2.guildedcdn.com/CustomReaction/54156ebff8c70a013c06643aca92b551-Full.webp?w=120&h=120"
);
export const exclamationmarkEmoteNode = createEmoteNode(
    2119403,
    "YokiLabsExclamationbox"
    // "4R56dNkl",
    // "https://img2.guildedcdn.com/CustomReaction/62307461393ae8e5788aa0f40ebf9485-Full.webp?w=120&h=120"
);
