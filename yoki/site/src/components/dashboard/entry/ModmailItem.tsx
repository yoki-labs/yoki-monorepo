import { Box, Chip, Stack, Typography } from "@mui/joy";
import DataTableRow from "../../DataTableRow";
import { LabsUserCard } from "../../LabsUserCard";
import { formatDate } from "@yokilabs/utils";
import { ItemProps } from "../../DataTable";
import { SanitizedModmailThread } from "../../../lib/@types/db";
import DataTableCard from "../../DataTableCard";
import { LabsCopyInput } from "../../LabsCopyInput";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faLockOpen } from "@fortawesome/free-solid-svg-icons";

export function ModmailTicketRow({ item: ticket, columnCount, timezone, isSelected, onSelected }: ItemProps<SanitizedModmailThread>) {
    return (
        <DataTableRow
            id={`ticket-row-${ticket.id}`}
            columnCount={columnCount}
            isSelected={isSelected}
            onSelected={onSelected}
            ExpandedInfoRenderer={() => <TicketExpandedInfo ticket={ticket} timezone={timezone} />}
        >
            <td>
                <LabsUserCard userId={ticket.openerId} />
            </td>
            <td>
                <TicketStatusBadge closed={ticket.closed} />
            </td>
            <td>
                <Typography level="body-md">{formatDate(new Date(ticket.createdAt), timezone)}</Typography>
            </td>
        </DataTableRow>
    );
}

export function ModmailTicketCard({ item: ticket, timezone, isSelected, onSelected }: ItemProps<SanitizedModmailThread>) {
    return (
        <DataTableCard
            id={`ticket-card-${ticket.id}`}
            isSelected={isSelected}
            onSelected={onSelected}
            TitleRenderer={() => (
                <>
                    <LabsUserCard userId={ticket.openerId} />
                    <Typography level="body-lg" textColor="text.tertiary">
                        {"\u2022"}
                    </Typography>
                    <TicketStatusBadge closed={ticket.closed} />
                </>
            )}
            ExpandedInfoRenderer={() => <TicketExpandedInfo ticket={ticket} timezone={timezone} />}
        >
        </DataTableCard>
    );
}

function TicketStatusBadge({ closed }: { closed: boolean; }) {
    return (
        <Chip color={closed ? "danger" : "success"} variant="outlined" startDecorator={<FontAwesomeIcon icon={closed ? faLock : faLockOpen} />}>
            {closed ? "Closed" : "Open"}
        </Chip>
    );
}

function TicketExpandedInfo({ ticket }: { ticket: SanitizedModmailThread; timezone: string | null }) {
    return (
        <Stack gap={3}>
            { ticket.handlingModerators.length
                ? <Box>
                    <Typography level="h2" fontSize="md" gutterBottom>
                        Handling moderators
                    </Typography>
                    <Stack direction="column" gap={1}>
                        {ticket.handlingModerators.map((x) =>
                            <LabsUserCard userId={x} />
                        )}
                    </Stack>
                </Box>
                : <Box>
                    <Typography level="h2" fontSize="md" gutterBottom>
                        No handling moderators.
                    </Typography>
                </Box>
            }
            <Box>
                <Typography level="h3" fontSize="md" gutterBottom>
                    Identifier
                </Typography>
                <LabsCopyInput text={ticket.id} sx={{ width: "max-content" }} />
            </Box>
        </Stack>
    );
}

