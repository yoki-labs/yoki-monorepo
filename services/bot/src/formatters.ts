export const inlineCode = (code: any) => `\`${code}\``;
export const bold = (text: any) => `**${text}**`;
export const listInlineCode = (str: string[]) => str.map(inlineCode).join(", ");
export const codeBlock = (code: any, language = "") => `\`\`\`${language}${code}\`\`\``;
export const quoteMarkdown = (code: string, limit: number) => `\`\`\`md\n${code.length > limit ? `${code.substring(0, limit)}...` : code}\n\`\`\``;
