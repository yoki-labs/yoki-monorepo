export const inlineCodeblock = (str: string) => `\`${str}\``;
export const listInlineCodeblock = (str: string[]) => str.map(inlineCodeblock).join(", ");
export const codeblock = (str: string) => `\`\`\`${str}\`\`\``;
export const quoteMarkdown = (code: string, limit: number) => `\`\`\`md\n${code.length > limit ? `${code.substring(0, limit)}...` : code}\n\`\`\``;
