import { IconDefinition, faBroom, faCircleExclamation, faHammer, faNoteSticky, faShoePrints, faVolumeMute } from "@fortawesome/free-solid-svg-icons";
import { Severity } from "@prisma/client";

export const severityToIcon: Record<Severity, IconDefinition> = {
    NOTE: faNoteSticky,
    MUTE: faVolumeMute,
    BAN: faHammer,
    KICK: faShoePrints,
    WARN: faCircleExclamation,
    SOFTBAN: faBroom,
};