export type RichMarkupObject = "value" | "document" | "block" | "inline" | "text" | "leaf" | "mark";

export type RichMarkupBlockElementType = "paragraph" | "code-line" | "code-container";
export type RichMarkupInlineElementType = "link" | "reaction" | "mention" | "channel";
export type RichMarkupElementType = RichMarkupBlockElementType | RichMarkupInlineElementType;

export type RichMarkupMarkType = "bold" | "italic" | "strikethrough" | "underline" | "spoiler" | "inline-code-v2";

export interface RichMarkupValue extends RichMarkupNode<"value"> {
    document: RichMarkupDocument;
}

export interface RichMarkupDocument extends RichMarkupNode<"document"> {
    data: {};
    nodes: RichMarkupBlockElement[];
}

export interface RichMarkupNode<T extends RichMarkupObject> {
    object: T;
}

export interface RichMarkupNodeHasData<T> {
    data: T;
}

export interface RichMarkupMark extends RichMarkupNode<"mark">, RichMarkupNodeHasData<unknown> {
    type: RichMarkupMarkType;
}

export interface RichMarkupLeaf extends RichMarkupNode<"leaf"> {
    text: string;
    marks: RichMarkupMark[];
}

export interface RichMarkupText extends RichMarkupNode<"text"> {
    leaves: RichMarkupLeaf[];
}

export interface RichMarkupElement<TObject extends RichMarkupObject, TType extends RichMarkupElementType, TSubNode extends RichMarkupNode<RichMarkupObject>, TData>
    extends RichMarkupNode<TObject>,
        RichMarkupNodeHasData<TData> {
    type: TType;
    nodes: TSubNode[];
}

export interface RichMarkupParagraph extends RichMarkupElement<"block", "paragraph", RichMarkupText | RichMarkupInlineElement, unknown> {}
export interface RichMarkupCodeLine extends RichMarkupElement<"block", "code-line", RichMarkupText, unknown> {}
export interface RichMarkupCodeContainer extends RichMarkupElement<"block", "code-container", RichMarkupCodeLine, { language: "unformatted" | "javascript"; }> {}

export type RichMarkupBlockElement = RichMarkupParagraph | RichMarkupCodeContainer;

export interface RichMarkupEmote
    extends RichMarkupElement<
        "inline",
        "reaction",
        RichMarkupText,
        {
            reaction: {
                id: number;
                customReactionId: number;
                customReaction?: {
                    id: number;
                    name: string;
                    png: string | null;
                    webp: string | null;
                    apng: string | null;
                    teamId: string;
                };
            };
        }
    > {}

export interface RichMarkupLink extends RichMarkupElement<"inline", "link", RichMarkupText, { href: string; }> {}

export interface RichMarkupUserMention
    extends RichMarkupElement<
        "inline",
        "mention",
        RichMarkupText,
        {
            mention: {
                type: "person";
                matcher: string;
                name: string;
                id: string;
                nickname: boolean;
                sortOrder: number;
                mentionedUser: {
                    id: string;
                    userInfo: {
                        id: string;
                        name: string;
                        nickname: string | null;
                        profilePicture?: string;
                        type: "user" | "bot";
                    };
                };
            };
        }
    > {}

export interface RichMarkupRoleMention
    extends RichMarkupElement<
        "inline",
        "mention",
        RichMarkupText,
        {
            mention: {
                type: "role";
                matcher: string;
                name: string;
                color: string;
                color2?: string;
                id: number;
                sortOrder: number;
            };
        }
    > {}

export interface RichMarkupChannelMention
    extends RichMarkupElement<
        "inline",
        "channel",
        RichMarkupText,
        {
            channel: {
                matcher: string;
                name: string;
                id: string;
            };
        }
    > {}

export type RichMarkupInlineElement = RichMarkupEmote | RichMarkupUserMention | RichMarkupRoleMention | RichMarkupChannelMention;
