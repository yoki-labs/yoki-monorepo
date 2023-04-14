import { WebhookEmbed } from "guilded.js";
import { stripIndents } from "common-tags";

// Remove any inline code escapes
export const escapeInlineCodeText = (code: any) => code.toString().replaceAll("\\", "\\\\").replaceAll("`", "'");
export const errorEmbed = (err: Error | any, additional_details?: Record<string, string | number | null>) =>
    new WebhookEmbed()
        .setDescription(
            stripIndents`
				${additional_details &&
                Object.keys(additional_details as object)
                    .map((key) => `${key}: \`${additional_details[key]}\``)
                    .join("\n")
                }
				${err.stack ?? err.message ?? JSON.stringify(err).slice(0, 1350)}
			`
        )
        .setColor("RED");

export const inlineCode = (code: any) => `\`${code}\``;
export const bold = (text: any) => `**${text}**`;

export function inlineQuote(text: any, maxLength?: number) {
    // Might be number, might be undefined
    const rawStr: string = text?.toString() || " ";

    // Trim the number, undefined, whatever
    const trimmed = maxLength && rawStr.length > maxLength ? `${rawStr.substring(0, maxLength - 3)}...` : rawStr;

    return `"\`${escapeInlineCodeText(trimmed)}\`"`;
}

export const highlight = (text: any) => `**__${text}__**`;
export const listInlineCode = (str: string[] | number[] | undefined) => (typeof str === "undefined" ? null : str.map(inlineCode).join(", "));
export const listInlineQuote = (str: string[] | undefined) => (typeof str === "undefined" ? null : str.map(inlineQuote).join(", "));
export const codeBlock = (code: any, language = "") => `\`\`\`${language}\n${code}\`\`\``;
export const quoteMarkdown = (code: string, limit: number) => `\`\`\`md\n${code.length > limit ? `${code.substring(0, limit)}...` : code}\n\`\`\``;
// export const errorEmbed = (err: Error | any, additional_details?: Record<string, string | number | null>) =>
//     new Embed()
//         .setDescription(
//             stripIndents`
// 				${
//                     additional_details &&
//                     Object.keys(additional_details as object)
//                         .map((key) => `${key}: \`${additional_details[key]}\``)
//                         .join("\n")
//                 }
// 				${err.stack ?? err.message ?? JSON.stringify(err).slice(0, 1350)}
// 			`
//         )
//         .setColor("RED");
export const channelName = (name: string, serverId: string, groupId: string, channelId: string, type?: string) =>
    `[#${name.length > 50 ? `${name.substring(0, 47)}...` : name}](https://guilded.gg/teams/${serverId}/groups/${groupId}/channels/${channelId}/${type ?? "chat"})`;
