export const inlineCodeblock = (str: string) => `\`${str}\``;
export const listInlineCodeblock = (str: string[]) => str.map(inlineCodeblock).join(", ");
export const codeblock = (str: string) => `\`\`\`${str}\`\`\``;
