import { ServerPayload } from "@guildedjs/api";
import { LabsSessionUser, LandingPageSessionProps } from "./pageUtil";

export const appealWaitingTime = 5 * 24 * 60 * 60 * 1000;

export interface BaseAppealsSessionProps {
    user: LabsSessionUser;
}

export type AppealsSessionProps =
    | (BaseAppealsSessionProps & {
          code: "NOT_FOUND" | "UNAVAILABLE" | "NOT_BANNED";
      })
    | (BaseAppealsSessionProps & {
          code: "TOO_FAST";
          elapsedTime: number;
      })
    | (BaseAppealsSessionProps & {
          code: null;
          server: ServerPayload;
      });
