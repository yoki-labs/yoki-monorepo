import { Stack, Typography } from "@mui/joy";
import DataTableRow from "../DataTableRow";
import { formatDate } from "@yokilabs/utils";
import { ItemProps } from "../DataTable";
import { SanitizedAppeal } from "../../lib/@types/db";
import DataTableCard from "../DataTableCard";
import { LabsServerCard } from "../LabsServerCard";
import AppealExpandedInfo from "../common/AppealExpandedInfo";
import AppealStatusBadge from "../common/AppealStatusBadge";

export function ProfileAppealRow({ item: appeal, columnCount, timezone, isSelected, onSelected }: ItemProps<SanitizedAppeal>) {
    const { content } = appeal;

    return (
        <DataTableRow
            id={`userappeal-row-${appeal.id}`}
            columnCount={columnCount}
            isSelected={isSelected}
            onSelected={onSelected}
            ExpandedInfoRenderer={() => <AppealExpandedInfo appeal={appeal} timezone={timezone} />}
        >
            <td>
                <LabsServerCard serverId={appeal.serverId} />
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

export function ProfileAppealCard({ item: appeal, timezone, isSelected, onSelected }: ItemProps<SanitizedAppeal>) {
    const { content } = appeal;

    return (
        <DataTableCard
            id={`userappeal-card-${appeal.id}`}
            isSelected={isSelected}
            onSelected={onSelected}
            TitleRenderer={() => (
                <>
                    <LabsServerCard serverId={appeal.serverId} />
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
