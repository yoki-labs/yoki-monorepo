import { faChevronDown, faChevronRight, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, IconButton, Input, Sheet, Table, Typography } from "@mui/joy";
import type { Action } from "@prisma/client";
import React from "react";

import { actions } from "../../../utils/dummyData";
import { severityToIcon } from "../../../utils/actionUtil";
import { formatDate } from "@yokilabs/utils";
import { DashboardPageProps } from "../pages";
import { LabsCopyInput } from "../../LabsCopyInput";
import { CSSProperties } from "styled-components";
import HistoryCase from "./HistoryCase";

const botId = "mGMEZ8r4";

interface State {
    expandedRows: string[];
}

export default class HistoryPage extends React.Component<DashboardPageProps, State> {
    constructor(props: DashboardPageProps) {
        super(props);

        this.state = { expandedRows: [] };
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
                    <tbody>
                        {actions.map((action) => <HistoryCase action={action} />)}
                    </tbody>
                </Table>
            </div>
        );
    }
}
