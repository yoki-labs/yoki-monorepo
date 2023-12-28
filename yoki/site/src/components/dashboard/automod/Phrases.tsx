import { Box, Stack, Typography } from "@mui/joy";
import React from "react";
import DashboardModule from "../DashboardModule";
import { DashboardPageProps } from "../pages";
import { faBan } from "@fortawesome/free-solid-svg-icons";
import DataTable, { querifyDataTableInfo } from "../../DataTable";
import { SanitizedContentFilter } from "../../../lib/@types/db";
import { PhraseCard, PhraseRow } from "./PhrasesItem";
import { LabsFormFieldType } from "../../form/form";
import { nullUserOptionList, optionifyUserDetails } from "../content";
import { severityOptions } from "../../../utils/actionUtil";
import { LabsFormFieldValueMap } from "../../form/LabsForm";

export default class PhrasesPage extends React.Component<DashboardPageProps> {
    constructor(props: DashboardPageProps) {
        super(props);
    }

    getPhrasesRoute(page: number, search?: string, filter?: LabsFormFieldValueMap) {
        const {
            serverConfig: { serverId },
        } = this.props;

        return `/api/servers/${serverId}/phrases?page=${page}${querifyDataTableInfo(search, filter)}`;
    }

    async fetchPhrases(page: number, search?: string, filter?: LabsFormFieldValueMap) {
        return fetch(this.getPhrasesRoute(page, search, filter), {
            method: "GET",
            headers: { "content-type": "application/json" },
        })
            .then((response) => {
                if (!response.ok) throw response;
                return response.json();
            })
            .then(({ items, count, users }) => ({ items, maxPages: Math.ceil(count / 50), users }));
    }

    async deletePhrases(phraseIds: number[], page: number, search?: string) {
        return fetch(this.getPhrasesRoute(page, search), {
            method: "DELETE",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ ids: phraseIds }),
        })
            .then((response) => {
                if (!response.ok) throw response;
                return response.json();
            })
            .then(({ items, count, users }) => ({ items, maxPages: Math.ceil(count / 50), users }));
    }

    render() {
        const { serverConfig } = this.props;

        return (
            <>
                <Box className="grid">
                    <DashboardModule
                        name="Phrase Filter"
                        description="Filters blacklisted phrases, as well as spam and links."
                        icon={faBan}
                        activeClassName="from-red-500 to-pink-500"
                        serverConfig={serverConfig}
                        prop="filterEnabled"
                        hideBadges
                        largeHeader
                    />
                </Box>
                <Stack direction="column" gap={3}>
                    <Typography level="h4">Banned phrases</Typography>
                    <DataTable<SanitizedContentFilter, number>
                        itemType="banned phrases"
                        timezone={serverConfig.timezone}
                        columns={["Content", "Severity", "By", "When"]}
                        getItems={this.fetchPhrases.bind(this)}
                        deleteItems={this.deletePhrases.bind(this)}
                        ItemRenderer={PhraseRow}
                        ItemMobileRenderer={PhraseCard}
                        getFilterFormFields={(users) => [
                            {
                                type: LabsFormFieldType.Picker,
                                name: "Creator",
                                prop: "user",
                                selectableValues: users ? optionifyUserDetails(Object.values(users)) : nullUserOptionList,
                                optional: true,
                                rightSideCheck: true,
                                height: 250,
                            },
                            {
                                type: LabsFormFieldType.Picker,
                                name: "Severity",
                                prop: "severity",
                                selectableValues: severityOptions,
                                optional: true,
                                rightSideCheck: true,
                                height: 250,
                            },
                        ]}
                    />
                </Stack>
            </>
        );
    }
}
