import { faChevronDown, faChevronRight, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, IconButton, Input, Sheet, Table, Typography } from "@mui/joy";
import type { Action } from "@prisma/client";
import React from "react";

import { actions } from "../../../utils/dummyData";
import { severityToIcon } from "../../../utils/actionUtil";
import { formatDate } from "@yokilabs/utils";
import { DashboardPageProps } from "./page";
import { LabsCopyInput } from "../../LabsCopyInput";
import { CSSProperties } from "styled-components";

const botId = "mGMEZ8r4";

interface State {
    expandedRows: string[];
}

export default class HistoryPage extends React.Component<DashboardPageProps, State> {
    constructor(props: DashboardPageProps) {
        super(props);

        this.state = { expandedRows: [] };
    }

    toggleRowExpansion(actionId: string) {
        const { expandedRows } = this.state;

        const index = this.state.expandedRows.indexOf(actionId);

        // It doesn't exist, so add it
        if (index < 0) return this.setState({ expandedRows: expandedRows.concat(actionId) });

        // To not mess with the state
        const clone = [...expandedRows];

        clone.splice(index, 1);

        this.setState({ expandedRows: clone });
    }

    renderRow(action: Action) {
        const isExpanded = this.state.expandedRows.includes(action.id);

        return (
            <>
                <tr data-id={action.id} style={{ "--TableCell-borderColor": isExpanded ? "transparent" : undefined } as unknown as CSSProperties}>
                    <td>
                        <IconButton onClick={this.toggleRowExpansion.bind(this, action.id)} color="neutral" aria-label="More button">
                            <FontAwesomeIcon icon={isExpanded ? faChevronDown : faChevronRight} />
                        </IconButton>
                    </td>
                    <td>
                        <Typography startDecorator={<FontAwesomeIcon icon={severityToIcon[action.type]} />} fontWeight="lg" textColor="text.secondary">
                            {action.type}
                        </Typography>
                    </td>
                    <td>
                        <Typography level="body2">{getReason(action.reason, action.executorId)}</Typography>
                    </td>
                    <td>{action.targetId}</td>
                    <td>{action.executorId}</td>
                    <td>
                        <Typography level="body2">{formatDate(action.createdAt)}</Typography>
                    </td>
                </tr>
                {/* isExpanded is modified by arrow button. This is for showing IDs and whatnot */}
                {isExpanded && this.renderRowInfo(action)}
            </>
        );
    }

    renderRowInfo(action: Action) {
        return (
            <tr data-id={action.id}>
                <td style={{ height: 0, padding: 0 }} colSpan={6}>
                    <Sheet variant="soft" sx={{ m: 1, borderRadius: 4, p: 1, pl: 6, pr: 6 }}>
                        <Typography level="h3" fontSize="sm" gutterBottom>Identifier</Typography>
                        <LabsCopyInput text={action.id} />
                    </Sheet>
                </td>
            </tr>
        );
    }

    render() {
        return (
            <div>
                <Box className="mb-4">
                    <Input placeholder="Search cases" startDecorator={<FontAwesomeIcon icon={faMagnifyingGlass} />} />
                </Box>

                <Table size="lg" variant="plain" sx={{ borderRadius: 8, overflow: "hidden", "--Table-headerUnderlineThickness": 0 }}>
                    <thead>
                        <tr>
                            <th style={{ width: 60 }}></th>
                            <th>Action</th>
                            <th>Reason</th>
                            <th>User</th>
                            <th>Moderator</th>
                            <th>CreatedAt</th>
                        </tr>
                    </thead>
                    <tbody>{actions.map((action) => this.renderRow(action))}</tbody>
                </Table>
            </div>
        );
    }
}

const getReason = (reason: string | null, executorId: string) => (executorId === botId && reason?.startsWith("[AUTOMOD]") ? reason.substring(10) : reason);
// {
//     if (reason.startsWith("[AUTOMOD]")) return <span className="py-1 px-2 rounded-lg text-spacelight-800">User violated automod rules</span>;
//     if (reason.length > 40) return `${reason.substring(0, 40)}...`;
//     return reason;
// };

const getExecutor = (executorId: string) => {
    return executorId === botId ? <span className="badge badge-md text-primary font-semibold">Automod</span> : executorId;
};