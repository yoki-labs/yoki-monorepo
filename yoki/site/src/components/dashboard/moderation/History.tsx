import { faClock, faDroplet } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, Stack, Typography } from "@mui/joy";
import React from "react";

import { DashboardPageProps } from "../pages";
import { SanitizedAction } from "../../../lib/@types/db";
import DataTable, { ItemProps } from "../../DataTable";
import DataTableRow from "../../DataTableRow";
import { LabsUserCard } from "../../LabsUserCard";
import { severityToIcon } from "../../../utils/actionUtil";
import CodeWrapper from "../../CodeWrapper";
import { LabsCopyInput } from "../../LabsCopyInput";
import InfoText from "../../InfoText";
import { formatDate } from "@yokilabs/utils";

export default class HistoryPage extends React.Component<DashboardPageProps> {
    constructor(props: DashboardPageProps) {
        super(props);
    }

    getCasesRoute(page: number, search?: string) {
        const { serverConfig: { serverId } } = this.props;

        return `/api/servers/${serverId}/cases?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}`;
    }

    async fetchCases(page: number, search?: string) {
        return fetch(this.getCasesRoute(page, search), {
            method: "GET",
            headers: { "content-type": "application/json" },
        })
            .then((response) => {
                if (!response.ok)
                    throw response;
                return response.json();
            })
            .then(({ cases, count }) => ({ items: cases, maxPages: Math.ceil(count / 50) }));
    } 

    async deleteCases(caseIds: string[], page: number, search?: string) {
        return fetch(this.getCasesRoute(page, search), {
            method: "DELETE",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ caseIds }),
        })
            .then((response) => {
                if (!response.ok)
                    throw response;
                return response.json();
            })
            .then(({ cases, count }) => ({ items: cases, maxPages: Math.ceil(count / 50) }));
    } 

    render() {
        const { serverConfig } = this.props;

        // // No cases to display
        // if (!cases.length)
        //     return <PagePlaceholder icon={PagePlaceholderIcon.NotFound} title="Squeaky clean history!" description="There are no moderation cases." />

        return (
            <Stack direction="column" gap={3}>
                <Typography level="h4" gutterBottom>Server history</Typography>

                <DataTable<SanitizedAction, string>
                    itemType="cases"
                    timezone={serverConfig.timezone}
                    columns={["User", "Action", "Moderator", "Reason", "When"]}
                    getItems={this.fetchCases.bind(this)}
                    deleteItems={this.deleteCases.bind(this)}
                    ItemRenderer={HistoryCase}
                    />
            </Stack>
        );
    }
}

function HistoryCase({ item: action, columnCount, timezone, isSelected, onSelected }: ItemProps<SanitizedAction>) {
    const { reason } = action;

    return (
        <DataTableRow
            id={action.id}
            columnCount={columnCount}
            isSelected={isSelected}
            onSelected={onSelected}
            expandedInfo={() =>
                <Stack gap={3}>
                    <Box>
                        <Typography level="h2" fontSize="md" gutterBottom>Reason</Typography>
                        <CodeWrapper>
                            <Typography textColor="text.secondary">
                                {action.reason}
                            </Typography>
                        </CodeWrapper>
                    </Box>
                    {action.triggerContent &&
                        <Box>
                            <Typography level="h2" fontSize="md" gutterBottom>Triggering content</Typography>
                            <CodeWrapper>
                                <Typography textColor="text.secondary">
                                    {action.triggerContent}
                                </Typography>
                            </CodeWrapper>
                        </Box>
                    }
                    <Box>
                        <Typography level="h3" fontSize="md" gutterBottom>Identifier</Typography>
                        <LabsCopyInput text={action.id} sx={{ width: "max-content" }} />
                    </Box>
                    {(action.infractionPoints || action.expiresAt) && <Box>
                        { action.infractionPoints && <InfoText icon={faDroplet} name="Infraction points">{action.infractionPoints}</InfoText> }
                        { action.expiresAt && <InfoText icon={faClock} name="Expires at">{formatDate(new Date(action.expiresAt), timezone)}</InfoText> }
                    </Box>}
                </Stack>
            }
        >
            <td>
                <LabsUserCard userId={action.targetId} />
            </td>
            <td>
                <Typography startDecorator={<FontAwesomeIcon icon={severityToIcon[action.type]} />} fontWeight="lg" textColor="text.secondary">
                    {action.type}
                </Typography>
            </td>
            <td>
                <LabsUserCard userId={action.executorId} />
            </td>
            <td>
                <Typography level="body-md">{reason && reason.length > 32 ? `${reason?.slice(0, 32)}...` : reason}</Typography>
            </td>
            <td>
                <Typography level="body-md">{formatDate(new Date(action.createdAt), timezone)}</Typography>
            </td>
        </DataTableRow>
    );
}