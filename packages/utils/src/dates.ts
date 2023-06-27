import timezonesJson from "./timezones.json";

const DateOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
} as const;

export function formatDate(date: Date, timezone?: string | undefined | null) {
    return date.toLocaleDateString("en-US", { ...DateOptions, timeZone: timezone ?? "America/New_York" });
}

export const timezones = timezonesJson;
