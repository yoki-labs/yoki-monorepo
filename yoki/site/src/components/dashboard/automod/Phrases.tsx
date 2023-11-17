import { Box, Stack, Typography } from "@mui/joy";
import React from "react";
import DashboardModule from "../DashboardModule";
import { DashboardPageProps } from "../pages";
import { faBan } from "@fortawesome/free-solid-svg-icons";
import DataTable from "../../DataTable";
import { SanitizedContentFilter } from "../../../lib/@types/db";
import { PhraseCard, PhraseRow } from "./PhrasesItem";

export default class PhrasesPage extends React.Component<DashboardPageProps> {
    constructor(props: DashboardPageProps) {
        super(props);
    }

    getPhrasesRoute(page: number, search?: string) {
        const {
            serverConfig: { serverId },
        } = this.props;

        return `/api/servers/${serverId}/phrases?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}`;
    }

    async fetchPhrases(page: number, search?: string) {
        return fetch(this.getPhrasesRoute(page, search), {
            method: "GET",
            headers: { "content-type": "application/json" },
        })
            .then((response) => {
                if (!response.ok) throw response;
                return response.json();
            })
            .then(({ phrases, count }) => ({ items: phrases, maxPages: Math.ceil(count / 50) }));
    }

    async deletePhrases(phraseIds: number[], page: number, search?: string) {
        return fetch(this.getPhrasesRoute(page, search), {
            method: "DELETE",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ phraseIds }),
        })
            .then((response) => {
                if (!response.ok) throw response;
                return response.json();
            })
            .then(({ phrases, count }) => ({ items: phrases, maxPages: Math.ceil(count / 50) }));
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
                    />
                </Stack>
            </>
        );
    }
}
