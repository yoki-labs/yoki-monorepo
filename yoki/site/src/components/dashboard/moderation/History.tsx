import { Stack, Typography } from "@mui/joy";
import React from "react";

import { DashboardPageProps } from "../pages";
import { SanitizedAction } from "../../../lib/@types/db";
import DataTable, { querifyDataTableInfo } from "../../DataTable";
import { HistoryCaseCard, HistoryCaseRow } from "./HistoryCase";
import { LabsFormFieldType } from "../../form/form";
import { severityOptions } from "../../../utils/actionUtil";
import { LabsFormFieldValueMap } from "../../form/LabsForm";
import { nullUserOption, nullUserOptionList, optionifyUserDetails } from "../content";

export default class HistoryPage extends React.Component<DashboardPageProps> {
    constructor(props: DashboardPageProps) {
        super(props);
    }

    getCasesRoute(page: number, search?: string, filter?: LabsFormFieldValueMap) {
        const {
            serverConfig: { serverId },
        } = this.props;

        return `/api/servers/${serverId}/cases?page=${page}${querifyDataTableInfo(search, filter)}`;
    }

    async fetchCases(page: number, search?: string, filter?: LabsFormFieldValueMap) {
        return fetch(this.getCasesRoute(page, search, filter), {
            method: "GET",
            headers: { "content-type": "application/json" },
        })
            .then((response) => {
                if (!response.ok) throw response;
                return response.json();
            })
            .then(({ items, count, users }) => ({ items, maxPages: Math.ceil(count / 50), users }));
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
                <Typography level="h4">Server history</Typography>
                <DataTable<SanitizedAction, string>
                    itemType="cases"

                    timezone={serverConfig.timezone}
                    columns={["User", "Action", "Moderator", "Reason", "When"]}

                    getItems={this.fetchCases.bind(this)}
                    deleteItems={this.deleteCases.bind(this)}

                    ItemRenderer={HistoryCaseRow}
                    ItemMobileRenderer={HistoryCaseCard}

                    getFilterFormFields={(users) => {
                        const userOptions = users ? optionifyUserDetails(Object.values(users)) : nullUserOptionList;

                        return [
                            {
                                type: LabsFormFieldType.Picker,
                                name: "Target",
                                prop: "target",
                                selectableValues: userOptions,
                                optional: true,
                                rightSideCheck: true,
                                height: 250,
                            },
                            // {
                            //     type: LabsFormFieldType.Picker,
                            //     name: "Staff",
                            //     prop: "executor",
                            //     selectableValues: userOptions,
                            //     optional: true,
                            //     rightSideCheck: true,
                            // },
                            {
                                type: LabsFormFieldType.Picker,
                                name: "Severity",
                                prop: "severity",
                                selectableValues: severityOptions,
                                optional: true,
                                rightSideCheck: true,
                                height: 250,
                            },
                        ]
                    }}
                />
            </Stack>
        );
    }
}
