import { Box, Stack, Typography } from "@mui/joy";
import { formatDate } from "@yokilabs/utils";
import { LabsUserCard } from "../../LabsUserCard";
import { ItemProps } from "../../DataTable";
import { SanitizedInviteFilter } from "../../../lib/@types/db";
import DataTableRow from "../../DataTableRow";
import DataTableCard from "../../DataTableCard";
import { LabsServerCard } from "../../LabsServerCard";

export function InviteRow({ item: invite, users, columnCount, timezone, isSelected, onSelected }: ItemProps<SanitizedInviteFilter>) {
    return (
        <DataTableRow
            id={`invite-row-${invite.id}`}
            columnCount={columnCount}
            isSelected={isSelected}
            onSelected={onSelected}
            // ExpandedInfoRenderer={() => (
            //     <Stack gap={3}>
            //         <InfoText icon={faDroplet} name="Infraction points">
            //             {invite}
            //         </InfoText>
            //     </Stack>
            // )}
        >
            <td>
                <LabsServerCard serverId={invite.targetServerId} />
            </td>
            <td>
                <LabsUserCard userId={invite.creatorId} user={users?.[invite.creatorId]} />
            </td>
            <td>
                <Typography level="body-md">{formatDate(new Date(invite.createdAt), timezone)}</Typography>
            </td>
        </DataTableRow>
    );
}

export function InviteCard({ item: invite, users, timezone, isSelected, onSelected }: ItemProps<SanitizedInviteFilter>) {
    return (
        <DataTableCard
            id={`invite-card-${invite.id}`}
            isSelected={isSelected}
            onSelected={onSelected}
            TitleRenderer={() => (
                <>
                    <LabsServerCard serverId={invite.targetServerId} />
                </>
            )}
            ExpandedInfoRenderer={() => (
                <Stack gap={3}>
                    <Box>
                        <Typography level="h2" fontSize="md" gutterBottom>
                            Creator
                        </Typography>
                        <LabsUserCard userId={invite.creatorId} user={users?.[invite.creatorId]} />
                    </Box>
                    <Box>
                        <Typography level="h2" fontSize="md" gutterBottom>
                            Created at
                        </Typography>
                        <Typography level="body-md">{formatDate(new Date(invite.createdAt), timezone)}</Typography>
                    </Box>
                </Stack>
            )}
        ></DataTableCard>
    );
}
