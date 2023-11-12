import { stripIndents } from "common-tags";
import { ChannelType, WebhookEmbed } from "guilded.js";

// Remove any inline code escapes
export const escapeInlineCodeText = (code: any) => code.toString().replaceAll("\\", "\\\\").replaceAll("`", "'");

// Basic
export const bold = (text: any) => `**${text}**`;
export const highlight = (text: any) => `**__${text}__**`;

// Codes and quotes
export const inlineCode = (code: any) => `\`${code}\``;
export function inlineQuote(text: any, maxLength?: number) {
    // Might be number, might be undefined
    const rawStr: string = text?.toString() || " ";

    // Trim the number, undefined, whatever
    const trimmed = maxLength && rawStr.length > maxLength ? `${rawStr.substring(0, maxLength - 3)}...` : rawStr;

    return `"\`${escapeInlineCodeText(trimmed)}\`"`;
}
export const listInlineCode = (str: string[] | number[] | undefined) => (typeof str === "undefined" ? null : str.map(inlineCode).join(", "));
export const listInlineQuote = (str: string[] | undefined) => (typeof str === "undefined" ? null : str.map(inlineQuote).join(", "));
export const codeBlock = (code: any, language?: string) => (language ? `\`\`\`${language}\n${code}\`\`\`` : `\`\`\`${code}\`\`\``);
export const quoteMarkdown = (code: string, limit: number) => `\`\`\`md\n${code.length > limit ? `${code.substring(0, limit)}...` : code}\n\`\`\``;

export const channelTypeToDisplay: Record<ChannelType, string> = {
    [ChannelType.Chat]: "Chat",
    [ChannelType.Voice]: "Voice",
    [ChannelType.Stream]: "Stream",
    [ChannelType.List]: "List",
    [ChannelType.Forums]: "Forum",
    [ChannelType.Calendar]: "Calendar",
    [ChannelType.Docs]: "Docs",
    [ChannelType.Media]: "Media",
    [ChannelType.Scheduling]: "Scheduling",
    [ChannelType.Announcements]: "Announcements",
};

export const channelName = (name: string, serverId: string, groupId: string, channelId: string, type?: string) =>
    `[#${name.length > 50 ? `${name.substring(0, 47)}...` : name}](https://guilded.gg/teams/${serverId}/groups/${groupId}/channels/${channelId}/${type ?? "chat"})`;

// Errors
export const errorEmbed = (err: string, additional_details?: Record<string, string | number | null>) => {
    const details = additional_details
        ? Object.keys(additional_details)
              .map((key) => `${key}: \`${additional_details[key]}\``)
              .join("\n")
        : "";
    return new WebhookEmbed()
        .setDescription(
            stripIndents`
				${details}
				${err.slice(0, 1350)}
            `
        )
        .setColor("RED");
};
