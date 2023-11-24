import { faLink } from "@fortawesome/free-solid-svg-icons";
import { Box, Stack, Typography } from "@mui/joy";
import React from "react";
import DashboardModule from "../DashboardModule";
import { DashboardPageProps } from "../pages";
import DataTable from "../../DataTable";
import { SanitizedInviteFilter } from "../../../lib/@types/db";
import { InviteCard, InviteRow } from "./InviteFilter";

export default class InvitesPage extends React.Component<DashboardPageProps> {
    constructor(props: DashboardPageProps) {
        super(props);
    }

    getInvitesRoute(page: number, search?: string) {
        const {
            serverConfig: { serverId },
        } = this.props;

        return `/api/servers/${serverId}/invites?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}`;
    }

    async fetchInvites(page: number, search?: string) {
        return fetch(this.getInvitesRoute(page, search), {
            method: "GET",
            headers: { "content-type": "application/json" },
        })
            .then((response) => {
                if (!response.ok) throw response;
                return response.json();
            })
            .then(({ items, count, users }) => ({ items, maxPages: Math.ceil(count / 50), users }));
    }

    async deleteInvites(urlIds: number[], page: number, search?: string) {
        return fetch(this.getInvitesRoute(page, search), {
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

    render() {
        const { serverConfig } = this.props;

        return (
            <>
                <Box className="grid gap-4">
                    <DashboardModule
                        name="Invite Filter"
                        description="Filters out invites to other non-whitelisted servers in chat."
                        icon={faLink}
                        activeClassName="from-red-500 to-orange-500"
                        serverConfig={serverConfig}
                        prop="filterInvites"
                        hideBadges
                        largeHeader
                    />
                </Box>
                <Stack direction="column" gap={3}>
                    <Typography level="h4">Invite whitelisted servers</Typography>
                    <DataTable<SanitizedInviteFilter, number>
                        itemType="whitelisted server"
                        timezone={serverConfig.timezone}
                        columns={["Server", "By", "When"]}
                        getItems={this.fetchInvites.bind(this)}
                        deleteItems={this.deleteInvites.bind(this)}
                        ItemRenderer={InviteRow}
                        ItemMobileRenderer={InviteCard}
                    />
                </Stack>
            </>
        );
    }
}
