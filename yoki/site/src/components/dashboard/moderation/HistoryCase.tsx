import { Box, Chip, Stack, Typography } from "@mui/joy";
import DataTableRow from "../../DataTableRow";
import CodeWrapper from "../../CodeWrapper";
import { LabsCopyInput } from "../../LabsCopyInput";
import InfoText from "../../InfoText";
import { faClock, faDroplet } from "@fortawesome/free-solid-svg-icons";
import { LabsUserCard } from "../../LabsUserCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { severityToIcon, severityToName } from "../../../utils/actionUtil";
import { formatDate } from "@yokilabs/utils";
import { ItemProps } from "../../DataTable";
import { SanitizedAction } from "../../../lib/@types/db";
import DataTableCard from "../../DataTableCard";
import { GuildedSanitizedUserDetail } from "../../../lib/@types/guilded";

export function HistoryCaseRow({ item: action, users, columnCount, timezone, disableSelection, isSelected, onSelected }: ItemProps<SanitizedAction>) {
    const { reason } = action;

    return (
        <DataTableRow
            id={action.id}
            columnCount={columnCount}
            disableSelection={disableSelection}
            isSelected={isSelected}
            onSelected={onSelected}
            ExpandedInfoRenderer={() => <CaseExpandedInfo action={action} timezone={timezone} />}
        >
            <td>
                <LabsUserCard userId={action.targetId} user={users?.[action.targetId]} />
            </td>
            <td>
                <CaseType action={action} />
            </td>
            <td>
                <LabsUserCard userId={action.executorId} user={users?.[action.executorId]} />
            </td>
            <td>
                {reason
                ? <Typography level="body-md">{reason.length > 32 ? `${reason?.slice(0, 32)}...` : reason}</Typography>
                : <Typography level="body-md" textColor="text.tertiary">No reason specified.</Typography>}
            </td>
            <td>
                <Typography level="body-md">{formatDate(new Date(action.createdAt), timezone)}</Typography>
            </td>
        </DataTableRow>
    );
}

export function HistoryCaseCard({ item: action, columnCount, users, timezone, disableSelection, isSelected, onSelected }: ItemProps<SanitizedAction>) {
    const { reason } = action;

    return (
        <DataTableCard
            id={action.id}
            disableSelection={disableSelection}
            isSelected={isSelected}
            onSelected={onSelected}
            TitleRenderer={() => (
                <>
                    <LabsUserCard userId={action.targetId} user={users?.[action.targetId]} />
                    <Typography level="body-lg" textColor="text.tertiary">
                        {"\u2022"}
                    </Typography>
                    <CaseType action={action} />
                </>
            )}
            ExpandedInfoRenderer={() => <CaseExpandedInfo action={action} timezone={timezone} executor={users?.[action.executorId]} includeExecutor />}
        >
            <Stack mt={2} gap={2} direction="column">
                <Typography level="body-md">{reason && reason.length > 32 ? `${reason?.slice(0, 32)}...` : reason}</Typography>
            </Stack>
        </DataTableCard>
    );
}

function CaseType({ action }: { action: SanitizedAction }) {
    return (
        <Typography startDecorator={<FontAwesomeIcon icon={severityToIcon[action.type]} />} fontWeight="lg" textColor="text.secondary">
            {severityToName[action.type]}
        </Typography>
    );
}

function CaseExpandedInfo({
    action,
    timezone,
    includeExecutor,
    executor,
}: {
    action: SanitizedAction;
    timezone: string | null;
    includeExecutor?: boolean;
    executor?: GuildedSanitizedUserDetail;
}) {
    return (
        <Stack gap={3}>
            {includeExecutor && (
                <Box>
                    <Typography level="h2" fontSize="md" gutterBottom>
                        Moderator
                    </Typography>
                    <LabsUserCard userId={action.executorId} user={executor} />
                </Box>
            )}
            {action.reason && <Box>
                <Typography level="h2" fontSize="md" gutterBottom>
                    Reason
                </Typography>
                <CodeWrapper>
                    <Typography textColor="text.secondary">{action.reason}</Typography>
                </CodeWrapper>
            </Box>}
            {action.triggerContent && (
                <Box>
                    <Typography level="h2" fontSize="md" gutterBottom>
                        Triggering content
                    </Typography>
                    <CodeWrapper>
                        <Typography textColor="text.secondary">{action.triggerContent}</Typography>
                    </CodeWrapper>
                </Box>
            )}
            <Box>
                <Typography level="h3" fontSize="md" gutterBottom>
                    Identifier
                </Typography>
                <LabsCopyInput text={action.id} sx={{ width: "max-content" }} />
            </Box>
            {(action.infractionPoints || action.expiresAt) && (
                <Box>
                    {action.infractionPoints && (
                        <InfoText icon={faDroplet} name="Infraction points">
                            {action.infractionPoints}
                        </InfoText>
                    )}
                    {action.expiresAt && (
                        <InfoText icon={faClock} name="Expires">
                            {formatDate(new Date(action.expiresAt), timezone)}
                        </InfoText>
                    )}
                </Box>
            )}
        </Stack>
    );
}
