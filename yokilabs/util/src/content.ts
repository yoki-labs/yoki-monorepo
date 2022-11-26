export const summarizeItems = <T>(items: T[], mapper: (item: T) => string, maxLength = 20) =>
    `${items.slice(0, maxLength).map(mapper).join(", ")}${items.length > maxLength ? ` and ${items.length - maxLength} more` : ""}`;

export const summarizeRolesOrUsers = (ids: Array<string | number>, maxLength = 20) => summarizeItems(ids, (id) => `<@${id}>`, maxLength);
