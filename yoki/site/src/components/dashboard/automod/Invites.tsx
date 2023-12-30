import { faLink } from "@fortawesome/free-solid-svg-icons";
import { Box, Stack, Typography } from "@mui/joy";
import React from "react";
import DashboardModule from "../DashboardModule";
import { DashboardPageProps } from "../pages";
import DataTable, { querifyDataTableInfo } from "../../DataTable";
import { SanitizedInviteFilter } from "../../../lib/@types/db";
import { InviteCard, InviteRow } from "./InviteFilter";
import { LabsFormFieldType } from "../../form/form";
import { nullUserOptionList, optionifyUserDetails } from "../content";
import { LabsFormFieldValueMap } from "../../form/LabsForm";
import { RoleType } from "@prisma/client";

export default class InvitesPage extends React.Component<DashboardPageProps> {
    constructor(props: DashboardPageProps) {
        super(props);
    }

    getInvitesRoute(page: number, search?: string, filter?: LabsFormFieldValueMap) {
        const {
            serverConfig: { serverId },
        } = this.props;

        return `/api/servers/${serverId}/invites?page=${page}${querifyDataTableInfo(search, filter)}`;
    }

    async fetchInvites(page: number, search?: string, filter?: LabsFormFieldValueMap) {
        return fetch(this.getInvitesRoute(page, search, filter), {
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
            body: JSON.stringify({ ids: urlIds }),
        })
            .then((response) => {
                if (!response.ok) throw response;
                return response.json();
            })
            .then(({ items, count, users }) => ({ items, maxPages: Math.ceil(count / 50), users }));
    }

    render() {
        const { serverConfig, highestRoleType } = this.props;

        return (
            <>
                <Box className="grid gap-4">
                    <DashboardModule
                        name="Invite Filter"
                        description="Filters out invites to other non-whitelisted servers in chat."
                        icon={faLink}
                        activeClassName="from-red-500 to-orange-500"
                        serverConfig={serverConfig}
                        disabled={highestRoleType !== RoleType.ADMIN}
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
                        disableOperations={highestRoleType !== RoleType.ADMIN}
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
                        ]}
                    />
                </Stack>
            </>
        );
    }
}
