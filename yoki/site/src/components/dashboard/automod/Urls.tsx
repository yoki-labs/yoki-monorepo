import { Box, Card, CardContent, Stack, Typography } from "@mui/joy";
import React from "react";
import DashboardModule from "../DashboardModule";
import { DashboardPageProps } from "../pages";
import { faBan } from "@fortawesome/free-solid-svg-icons";
import DataTable from "../../DataTable";
import { SanitizedUrlFilter } from "../../../lib/@types/db";
import { severityOptions } from "../../../utils/actionUtil";
import LabsForm from "../../form/LabsForm";
import { LabsFormFieldType, LabsFormSectionOrder } from "../../form/form";
import { Severity } from "@prisma/client";
import { errorifyResponseError, notifyFetchError } from "../../../utils/errorUtil";
import { UrlCard, UrlRow } from "./UrlItem";

export default class UrlsPage extends React.Component<DashboardPageProps> {
    constructor(props: DashboardPageProps) {
        super(props);
    }

    getUrlsRoute(page: number, search?: string) {
        const {
            serverConfig: { serverId },
        } = this.props;

        return `/api/servers/${serverId}/urls?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}`;
    }

    async fetchUrls(page: number, search?: string) {
        return fetch(this.getUrlsRoute(page, search), {
            method: "GET",
            headers: { "content-type": "application/json" },
        })
            .then((response) => {
                if (!response.ok) throw response;
                return response.json();
            })
            .then(({ items, count, users }) => ({ items, maxPages: Math.ceil(count / 50), users }));
    }

    async deleteUrls(urlIds: number[], page: number, search?: string) {
        return fetch(this.getUrlsRoute(page, search), {
            method: "DELETE",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ urlIds }),
        })
            .then((response) => {
                if (!response.ok) throw response;
                return response.json();
            })
            .then(({ items, count, users }) => ({ items, maxPages: Math.ceil(count / 50), users }));
    }

    async onServerUpdate(urlFilterIsWhitelist: boolean | null, linkSeverity: Severity | null, linkInfractionPoints: number | null) {
        const { serverId } = this.props.serverConfig;

        return fetch(`/api/servers/${serverId}`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ urlFilterIsWhitelist, linkSeverity, linkInfractionPoints }),
        })
            .then(errorifyResponseError)
            .catch(notifyFetchError.bind(null, "Error while creating role data"));
    }

    async modifyServerConfig(urlFilterIsWhitelist: boolean | undefined | null, linkSeverity: Severity | undefined | null, linkInfractionPoints: number | undefined | null) {
        const { serverId } = this.props.serverConfig;

        return fetch(`/api/servers/${serverId}`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ urlFilterIsWhitelist, linkSeverity, linkInfractionPoints }),
        })
            .then(errorifyResponseError)
            .catch(notifyFetchError.bind(null, "Error while updating server data for role changes"));
    }

    render() {
        const { serverConfig } = this.props;

        return (
            <>
                <Box className="grid">
                    <DashboardModule
                        name="Url Filter"
                        description="Filters blacklisted or non-whitelisted URLs, as well as spam and blacklisted phrases."
                        icon={faBan}
                        activeClassName="from-red-500 to-pink-500"
                        serverConfig={serverConfig}
                        prop="filterEnabled"
                        hideBadges
                        largeHeader
                    />
                </Box>
                <Box>
                    <Typography level="h4" gutterBottom>
                        URL filter list configuration
                    </Typography>
                    <Card>
                        <CardContent>
                            <LabsForm
                                sections={[
                                    {
                                        order: LabsFormSectionOrder.Grid,
                                        fields: [
                                            {
                                                type: LabsFormFieldType.Toggle,
                                                prop: "urlFilterIsWhitelist",
                                                name: "URL Filter list is whitelist",
                                                description:
                                                    "Whether URLs added to the filter is a whitelist instead of a blacklist. Off \u2014 link blacklist, on \u2014 link whitelist.",
                                                defaultValue: serverConfig.urlFilterIsWhitelist,
                                            },
                                        ],
                                    },
                                    {
                                        name: "Non-whitelisted link punishment",
                                        order: LabsFormSectionOrder.Grid,
                                        fields: [
                                            {
                                                type: LabsFormFieldType.Select,
                                                prop: "linkSeverity",
                                                name: "Link severity",
                                                description: "What will be done when someone posts a link that is not in the filter whitelist.",
                                                selectableValues: severityOptions,
                                                defaultValue: serverConfig.linkSeverity,
                                            },
                                            {
                                                type: LabsFormFieldType.Number,
                                                prop: "linkInfractionPoints",
                                                name: "Link infraction points",
                                                description: "The amount of infraction points to give when someone posts a link that is not in the filter whitelist.",
                                                defaultValue: serverConfig.linkInfractionPoints,
                                                min: 1,
                                                max: 100,
                                            },
                                        ],
                                    },
                                ]}
                                onSubmit={({ urlFilterIsWhitelist, linkSeverity, linkInfractionPoints }) =>
                                    this.modifyServerConfig(
                                        urlFilterIsWhitelist as boolean | undefined | null,
                                        linkSeverity as Severity | undefined | null,
                                        linkInfractionPoints as number | undefined | null
                                    )
                                }
                            />
                        </CardContent>
                    </Card>
                </Box>
                <Stack direction="column" gap={3}>
                    <Typography level="h4">Blacklisted or whitelisted URLs</Typography>
                    <DataTable<SanitizedUrlFilter, number>
                        itemType="filter list URLs"
                        timezone={serverConfig.timezone}
                        columns={["Content", "Severity", "Created by", "Created at"]}
                        getItems={this.fetchUrls.bind(this)}
                        deleteItems={this.deleteUrls.bind(this)}
                        ItemRenderer={UrlRow}
                        ItemMobileRenderer={UrlCard}
                    />
                </Stack>
            </>
        );
    }
}
