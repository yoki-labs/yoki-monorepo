// Remove any inline code escapes
export const escapeInlineCodeText = (code: any) => code.toString().replaceAll("\\", "\\\\").replaceAll("`", "'");

export const inlineCode = (code: any) => `\`${code}\``;
export const bold = (text: any) => `**${text}**`;
export const inlineQuote = (text: any) => `"\`${escapeInlineCodeText(text)}\`"`;
export const highlight = (text: any) => `**__${text}__**`;
export const listInlineCode = (str: string[] | number[] | undefined) => (typeof str === "undefined" ? null : str.map(inlineCode).join(", "));
export const codeBlock = (code: any, language = "") => `\`\`\`${language}\n${code}\`\`\``;
export const quoteMarkdown = (code: string, limit: number) => `\`\`\`md\n${code.length > limit ? `${code.substring(0, limit)}...` : code}\n\`\`\``;
