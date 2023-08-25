import { Box, Stack, Typography } from "@mui/joy";
import React from "react";
import DashboardModule from "../DashboardModule";
import { DashboardPageProps } from "../pages";
import { faBan, faDroplet, faLink } from "@fortawesome/free-solid-svg-icons";
import DataTable, { ItemProps } from "../../DataTable";
import { SanitizedUrlFilter } from "../../../lib/@types/db";
import DataTableRow from "../../DataTableRow";
import InfoText from "../../InfoText";
import { LabsUserCard } from "../../LabsUserCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { severityToIcon } from "../../../utils/actionUtil";
import { formatDate } from "@yokilabs/utils";

export default class UrlsPage extends React.Component<DashboardPageProps> {
    constructor(props: DashboardPageProps) {
        super(props);
    }

    getPhrasesRoute(page: number, search?: string) {
        const { serverConfig: { serverId } } = this.props;

        return `/api/servers/${serverId}/urls?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}`;
    }

    async fetchUrls(page: number, search?: string) {
        return fetch(this.getPhrasesRoute(page, search), {
            method: "GET",
            headers: { "content-type": "application/json" },
        })
            .then((response) => {
                if (!response.ok)
                    throw response;
                return response.json();
            })
            .then(({ urls, count }) => ({ items: urls, maxPages: Math.ceil(count / 50) }));
    } 

    async deleteUrls(urlIds: number[], page: number, search?: string) {
        return fetch(this.getPhrasesRoute(page, search), {
            method: "DELETE",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ urlIds }),
        })
            .then((response) => {
                if (!response.ok)
                    throw response;
                return response.json();
            })
            .then(({ urls, count }) => ({ items: urls, maxPages: Math.ceil(count / 50) }));
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
                        iconAspectRatio={0.9}
                        hideBadges
                        largeHeader
                    />
                </Box>
                <Stack direction="column" gap={3}>
                    <Typography level="h4">Banned URLs/domains</Typography>
                    <DataTable<SanitizedUrlFilter, number>
                        itemType="banned URLs"
                        timezone={serverConfig.timezone}
                        columns={["Content", "Severity", "Created by", "Created at"]}
                        getItems={this.fetchUrls.bind(this)}
                        deleteItems={this.deleteUrls.bind(this)}
                        ItemRenderer={LinkRow}
                        />
                </Stack>
            </>
        );
    }
}

function LinkRow({ item: link, columnCount, timezone, isSelected, onSelected }: ItemProps<SanitizedUrlFilter>) {
    return (
        <DataTableRow
            id={`link-${link.id}`}
            columnCount={columnCount}
            isSelected={isSelected}
            onSelected={onSelected}
            expandedInfo={() =>
                <Stack gap={3}>
                    <InfoText icon={faDroplet} name="Infraction points">{link.infractionPoints}</InfoText>
                </Stack>
            }
        >
            <td>
                <UrlContentDisplay
                    subdomain={link.subdomain}
                    domain={link.domain}
                    route={link.route}
                    />
            </td>
            <td>
                <Typography startDecorator={<FontAwesomeIcon icon={severityToIcon[link.severity]} />} fontWeight="lg" textColor="text.secondary">
                    {link.severity}
                </Typography>
            </td>
            <td>
                <LabsUserCard userId={link.creatorId} />
            </td>
            <td>
                <Typography level="body2">{formatDate(new Date(link.createdAt), timezone)}</Typography>
            </td>
        </DataTableRow>
    );
}

function UrlContentDisplay({ subdomain, domain, route }: { subdomain: string | null; domain: string; route: string | null; }) {
    return (
        <Typography level="body2" textColor="text.secondary">
            {subdomain}{domain}{route}
        </Typography>
    )
}