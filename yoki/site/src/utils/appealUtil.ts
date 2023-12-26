import { faCheck, faClock, faTimes } from "@fortawesome/free-solid-svg-icons";
import { ServerPayload } from "@guildedjs/api";
import { AppealStatus } from "@prisma/client";

import { LabsSessionUser } from "./routes/pages";
import { LabsFormFieldOption } from "../components/form/form";

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

export const appealStatusOptions: LabsFormFieldOption<AppealStatus | "AWAITING">[] = [
    {
        name: "Accepted",
        value: AppealStatus.ACCEPTED,
        icon: faCheck,
        description: "Unban has been accepted.",
    },
    {
        name: "Awaiting",
        value: "AWAITING",
        icon: faClock,
        description: "User is awaiting a response.",
    },
    {
        name: "Declined",
        value: AppealStatus.DECLINED,
        icon: faTimes,
        description: "Unban has been declined.",
    },
];
