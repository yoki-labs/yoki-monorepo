import { Stack, Typography } from "@mui/joy";
import DataTableRow from "../../DataTableRow";
import { LabsUserCard } from "../../LabsUserCard";
import { formatDate } from "@yokilabs/utils";
import { ItemProps } from "../../DataTable";
import { SanitizedAppeal } from "../../../lib/@types/db";
import DataTableCard from "../../DataTableCard";
import AppealExpandedInfo from "../../common/AppealExpandedInfo";
import AppealStatusBadge from "../../common/AppealStatusBadge";

export function AppealRow({ item: appeal, users, columnCount, timezone, disableSelection, isSelected, onSelected }: ItemProps<SanitizedAppeal>) {
    const { content } = appeal;

    return (
        <DataTableRow
            id={`appeal-row-${appeal.id}`}
            columnCount={columnCount}
            disableSelection={disableSelection}
            isSelected={isSelected}
            onSelected={onSelected}
            ExpandedInfoRenderer={() => <AppealExpandedInfo appeal={appeal} timezone={timezone} />}
        >
            <td>
                <LabsUserCard userId={appeal.creatorId} user={users?.[appeal.creatorId]} />
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

export function AppealCard({ item: appeal, users, timezone, disableSelection, isSelected, onSelected }: ItemProps<SanitizedAppeal>) {
    const { content } = appeal;

    return (
        <DataTableCard
            id={`appeal-card-${appeal.id}`}
            disableSelection={disableSelection}
            isSelected={isSelected}
            onSelected={onSelected}
            TitleRenderer={() => (
                <>
                    <LabsUserCard userId={appeal.creatorId} user={users?.[appeal.creatorId]} />
                    <Typography level="body-lg" textColor="text.tertiary">
                        {"\u2022"}
                    </Typography>
                    <AppealStatusBadge status={appeal.status} />
                </>
            )}
            ExpandedInfoRenderer={() => <AppealExpandedInfo appeal={appeal} timezone={timezone} />}
        >
            <Stack mt={2} gap={2} direction="column">
                <Typography level="body-md">{content && content.length > 50 ? `${content.split("\n").join(" ")?.slice(0, 50)}...` : content.split("\n").join(" ")}</Typography>
            </Stack>
        </DataTableCard>
    );
}
