import { Stack, Typography } from "@mui/joy";
import React from "react";

import { DashboardPageProps } from "../pages";
import { SanitizedAction } from "../../../lib/@types/db";
import DataTable from "../../DataTable";
import { HistoryCaseCard, HistoryCaseRow } from "./HistoryCase";
export default class HistoryPage extends React.Component<DashboardPageProps> {
    constructor(props: DashboardPageProps) {
        super(props);
    }

    getCasesRoute(page: number, search?: string) {
        const {
            serverConfig: { serverId },
        } = this.props;

        return `/api/servers/${serverId}/cases?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}`;
    }

    async fetchCases(page: number, search?: string) {
        return fetch(this.getCasesRoute(page, search), {
            method: "GET",
            headers: { "content-type": "application/json" },
        })
            .then((response) => {
                if (!response.ok) throw response;
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
                if (!response.ok) throw response;
                return response.json();
            })
            .then(({ cases, count }) => ({ items: cases, maxPages: Math.ceil(count / 50) }));
    }

    render() {
        const { serverConfig } = this.props;

        return (
            <Stack direction="column" gap={3}>
                <Typography level="h4" gutterBottom>
                    Server history
                </Typography>

                <DataTable<SanitizedAction, string>
                    itemType="cases"
                    timezone={serverConfig.timezone}
                    columns={["User", "Action", "Moderator", "Reason", "When"]}
                    getItems={this.fetchCases.bind(this)}
                    deleteItems={this.deleteCases.bind(this)}
                    ItemRenderer={HistoryCaseRow}
                    ItemMobileRenderer={HistoryCaseCard}
                />
            </Stack>
        );
    }
}
