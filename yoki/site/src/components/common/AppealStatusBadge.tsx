import { IconDefinition, faCheck, faClock, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Chip, ColorPaletteProp } from "@mui/joy";
import { AppealStatus } from "@prisma/client";

const appealStatusToDisplay: Record<AppealStatus, [IconDefinition, ColorPaletteProp, string]> = {
    [AppealStatus.ACCEPTED]: [faCheck, "success", "Accepted"],
    [AppealStatus.DECLINED]: [faTimes, "danger", "Declined"],
};
const defaultAppealStatusDisplay: [IconDefinition, ColorPaletteProp, string] = [faClock, "warning", "Awaiting"];

export default function AppealStatusBadge({ status }: { status: AppealStatus | null }) {
    const [icon, color, text] = status ? appealStatusToDisplay[status] : defaultAppealStatusDisplay;

    return (
        <Chip color={color} variant="soft" startDecorator={<FontAwesomeIcon icon={icon} />}>
            {text}
        </Chip>
    );
}
