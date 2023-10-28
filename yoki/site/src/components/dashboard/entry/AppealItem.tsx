import { Box, Chip, ColorPaletteProp, Stack, Typography } from "@mui/joy";
import DataTableRow from "../../DataTableRow";
import CodeWrapper from "../../CodeWrapper";
import { LabsUserCard } from "../../LabsUserCard";
import { formatDate } from "@yokilabs/utils";
import { ItemProps } from "../../DataTable";
import { SanitizedAppeal } from "../../../lib/@types/db";
import DataTableCard from "../../DataTableCard";
import { AppealStatus } from "@prisma/client";

const appealStatusToDisplay: Record<AppealStatus, [ColorPaletteProp, string]> = {
    [AppealStatus.ACCEPTED]: ["success", "Accepted"],
    [AppealStatus.DECLINED]: ["danger", "Declined"],
};
const defaultAppealStatusDisplay: [ColorPaletteProp, string] = ["warning", "Awaiting"];

export function AppealRow({ item: appeal, columnCount, timezone, isSelected, onSelected }: ItemProps<SanitizedAppeal>) {
    const { content } = appeal;

    return (
        <DataTableRow
            id={`appeal-row-${appeal.id}`}
            columnCount={columnCount}
            isSelected={isSelected}
            onSelected={onSelected}
            ExpandedInfoRenderer={() => <AppealExpandedInfo appeal={appeal} timezone={timezone} />}
        >
            <td>
                <LabsUserCard userId={appeal.creatorId} />
            </td>
            <td>
                <Typography level="body-md">{content && content.length > 50 ? `${content?.slice(0, 50)}...` : content}</Typography>
            </td>
            <td>
                <AppealStatusBadge status={appeal.status} />
            </td>
            <td>
                <Typography level="body-md">{formatDate(new Date(appeal.createdAt), timezone)}</Typography>
            </td>
        </DataTableRow>
    );
}

export function AppealCard({ item: appeal, timezone, isSelected, onSelected }: ItemProps<SanitizedAppeal>) {
    const { content } = appeal;

    return (
        <DataTableCard
            id={`appeal-card-${appeal.id}`}
            isSelected={isSelected}
            onSelected={onSelected}
            TitleRenderer={() => (
                <>
                    <LabsUserCard userId={appeal.creatorId} />
                    <Typography level="body-lg" textColor="text.tertiary">
                        {"\u2022"}
                    </Typography>
                    <AppealStatusBadge status={appeal.status} />
                </>
            )}
            ExpandedInfoRenderer={() => <AppealExpandedInfo appeal={appeal} timezone={timezone} />}
        >
            <Stack mt={2} gap={2} direction="column">
                <Typography level="body-md">{content && content.length > 50 ? `${content?.slice(0, 50)}...` : content}</Typography>
            </Stack>
        </DataTableCard>
    );
}

function AppealStatusBadge({ status }: { status: AppealStatus | null }) {
    const [color, text] = status ? appealStatusToDisplay[status] : defaultAppealStatusDisplay;

    return (
        <Chip color={color} variant="outlined">
            {text}
        </Chip>
    );
}

function AppealExpandedInfo({ appeal }: { appeal: SanitizedAppeal; timezone: string | null }) {
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
