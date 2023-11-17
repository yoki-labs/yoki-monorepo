import { faBroom, faCircleExclamation, faDoorOpen, faHammer, faNoteSticky, faVolumeMute, IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { Severity } from "@prisma/client";

import { LabsFormFieldOption } from "../components/form/form";

export const severityToIcon: Record<Severity, IconDefinition> = {
    NOTE: faNoteSticky,
    MUTE: faVolumeMute,
    BAN: faHammer,
    KICK: faDoorOpen,
    WARN: faCircleExclamation,
    SOFTBAN: faBroom,
};

export const severityToName: Record<Severity, string> = {
    NOTE: "Note",
    MUTE: "Mute",
    BAN: "Ban",
    KICK: "Kick",
    WARN: "Warning",
    SOFTBAN: "Flush",
};

export const severityOptions: LabsFormFieldOption<Severity>[] = [
    {
        name: "Note",
        value: Severity.NOTE,
        icon: severityToIcon[Severity.NOTE],
    },
    {
        name: "Warning",
        value: Severity.WARN,
        icon: severityToIcon[Severity.WARN],
    },
    {
        name: "Mute",
        value: Severity.MUTE,
        icon: severityToIcon[Severity.MUTE],
    },
    {
        name: "Kick",
        value: Severity.KICK,
        icon: severityToIcon[Severity.KICK],
    },
    {
        name: "Flush/Soft-ban",
        value: Severity.SOFTBAN,
        icon: severityToIcon[Severity.SOFTBAN],
    },
    {
        name: "Ban",
        value: Severity.BAN,
        icon: severityToIcon[Severity.BAN],
    },
];
