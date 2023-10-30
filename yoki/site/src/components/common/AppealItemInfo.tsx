import { Box, Chip, ColorPaletteProp, Stack, Typography } from "@mui/joy";
import CodeWrapper from "../CodeWrapper";
import { SanitizedAppeal } from "../../lib/@types/db";
import { AppealStatus } from "@prisma/client";
import { IconDefinition, faCheck, faClock, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const appealStatusToDisplay: Record<AppealStatus, [IconDefinition, ColorPaletteProp, string]> = {
    [AppealStatus.ACCEPTED]: [faCheck, "success", "Accepted"],
    [AppealStatus.DECLINED]: [faTimes, "danger", "Declined"],
};
export const defaultAppealStatusDisplay: [IconDefinition, ColorPaletteProp, string] = [faClock, "warning", "Awaiting"];

export function AppealStatusBadge({ status }: { status: AppealStatus | null }) {
    const [icon, color, text] = status ? appealStatusToDisplay[status] : defaultAppealStatusDisplay;

    return (
        <Chip color={color} variant="outlined" startDecorator={<FontAwesomeIcon icon={icon} />}>
            {text}
        </Chip>
    );
}

export function AppealExpandedInfo({ appeal }: { appeal: SanitizedAppeal; timezone: string | null }) {
    return (
        <Stack gap={3}>
            <Box>
                <Typography level="h2" fontSize="md" gutterBottom>
                    Reason for appealing
                </Typography>
                <CodeWrapper>
                    <Typography textColor="text.secondary">{appeal.content}</Typography>
                </CodeWrapper>
            </Box>
            { appeal.staffNote && <Box>
                <Typography level="h2" fontSize="md" gutterBottom>
                    Staff note
                </Typography>
                <CodeWrapper>
                    <Typography textColor="text.secondary">{appeal.staffNote}</Typography>
                </CodeWrapper>
            </Box> }
        </Stack>
    );
}
