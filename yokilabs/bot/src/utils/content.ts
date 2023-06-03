export const summarizeItems = <T>(items: T[], mapper: (item: T) => string, maxLength = 20) =>
    `${items.slice(0, maxLength).map(mapper).join(", ")}${items.length > maxLength ? ` and ${items.length - maxLength} more` : ""}`;

export const summarizeRolesOrUsers = (ids: Array<string | number>, maxLength = 20) => summarizeItems(ids, (id) => `<@${id}>`, maxLength);

const DateOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
} as const;

export function formatDate(date: Date, timeZone?: string | undefined | null) {
    return date.toLocaleDateString("en-US", { ...DateOptions, timeZone: timeZone ?? "America/New_York" });
}