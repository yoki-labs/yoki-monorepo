import { Embed } from "@guildedjs/webhook-client";

// Remove any inline code escapes
export const escapeInlineCodeText = (code: any) => code.toString().replaceAll("\\", "\\\\").replaceAll("`", "'");

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
export const listInlineCode = (str: string[] | number[] | undefined) => (typeof str === "undefined" ? "" : str.map(inlineCode).join(", "));
export const listInlineQuote = (str: string[] | undefined) => (typeof str === "undefined" ? "" : str.map(inlineQuote).join(", "));
export const codeBlock = (code: any, language?: string) => `\`\`\`${language ? `${language}\n` : ""}${code}\`\`\``;
export const quoteMarkdown = (code: string, limit: number) => `\`\`\`md\n${code.length > limit ? `${code.substring(0, limit)}...` : code}\n\`\`\``;
export function errorEmbed(err: Error | any, additionalDetails?: Record<string, string | number | null>) {
	const embed = new Embed()
		.setTitle(err.name)
		.setDescription(codeBlock((err?.stack ?? err)?.slice(0, 2040) ?? "No error provided."))
		.addField("Message", err?.message)
		.setColor("RED");

	if (additionalDetails)
		embed.addField("Additional Info", codeBlock(
			Object.keys(additionalDetails as object)
				.map((key) => `${key}: ${additionalDetails[key]}`)
				.join("\n")
				.slice(0, 1024)
		));

	return embed;
}
export const channelName = (name: string, serverId: string, groupId: string, channelId: string, type?: string) =>
	`[#${name}](https://guilded.gg/teams/${serverId}/groups/${groupId}/channels/${channelId}/${type ?? "chat"})`;
