import { ServerPayload } from "@guildedjs/api";

export const appealWaitingTime = 5 * 24 * 60 * 60 * 1000;

export type BaseAppealsSessionProps = {
    user: Partial<{
        name: string | null;
        avatar: string | null;
    }>;
};

export type AppealsSessionProps = (BaseAppealsSessionProps & {
    code: "NOT_FOUND" | "UNAVAILABLE" | "NOT_BANNED";
}) | (BaseAppealsSessionProps & {
    code: "TOO_FAST";
    elapsedTime: number;
}) | (BaseAppealsSessionProps & {
    code: null;
    server: ServerPayload;
});