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
export const listInlineCode = (str: string[] | number[] | undefined) => (typeof str === "undefined" ? null : str.map(inlineCode).join(", "));
export const listInlineQuote = (str: string[] | undefined) => (typeof str === "undefined" ? null : str.map(inlineQuote).join(", "));
export const codeBlock = (code: any, language = "") => `\`\`\`${language}\n${code}\`\`\``;
export const quoteMarkdown = (code: string, limit: number) => `\`\`\`md\n${code.length > limit ? `${code.substring(0, limit)}...` : code}\n\`\`\``;
