import { Box, Card, CardContent, Stack, Typography } from "@mui/joy";
import React from "react";
import DashboardModule from "../DashboardModule";
import { DashboardPageProps } from "../pages";
import { faPrayingHands } from "@fortawesome/free-solid-svg-icons";
import DataTable, { querifyDataTableInfo } from "../../DataTable";
import { SanitizedAppeal } from "../../../lib/@types/db";
import { AppealCard, AppealRow } from "./AppealItem";
import LabsForm, { LabsFormFieldValueMap } from "../../form/LabsForm";
import { LabsFormFieldType, LabsFormSectionOrder } from "../../form/form";
import { errorifyResponseError, notifyFetchError } from "../../../utils/errorUtil";
import { GuildedSanitizedChannel } from "../../../lib/@types/guilded";
import { channelsToSelectionOptions } from "../channels";
import { appealStatusOptions } from "../../../utils/appealUtil";
import { nullUserOptionList, optionifyUserDetails } from "../content";
import { RoleType } from "@prisma/client";
import { LabsCopyInput } from "../../LabsCopyInput";

type State = {
    isMounted: boolean;
    serverChannels: GuildedSanitizedChannel[];
};

export default class AppealsPage extends React.Component<DashboardPageProps, State> {
    constructor(props: DashboardPageProps) {
        super(props);

        this.state = { isMounted: false, serverChannels: [] };
    }

    componentDidMount(): unknown {
        // To not re-mount
        if (this.state.isMounted) return;

        this.setState({ isMounted: true });

        return this.fetchAppealInfo();
    }

    getAppealsRoute(page: number, search?: string, filter?: LabsFormFieldValueMap | undefined) {
        const {
            serverConfig: { serverId },
        } = this.props;

        return `/api/servers/${serverId}/appeals?page=${page}${querifyDataTableInfo(search, filter)}`;
    }

    async fetchAppeals(page: number, search?: string, filter?: LabsFormFieldValueMap | undefined) {
        return fetch(this.getAppealsRoute(page, search, filter), {
            method: "GET",
            headers: { "content-type": "application/json" },
        })
            .then((response) => {
                if (!response.ok) throw response;
                return response.json();
            })
            .then(({ items, count, users }) => ({ items, maxPages: Math.ceil(count / 50), users }));
    }

    async deleteAppeals(ids: number[], page: number, search?: string) {
        return fetch(this.getAppealsRoute(page, search), {
            method: "DELETE",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ ids }),
        })
            .then((response) => {
                if (!response.ok) throw response;
                return response.json();
            })
            .then(({ items, count, users }) => ({ items, maxPages: Math.ceil(count / 50), users }));
    }

    async fetchAppealInfo() {
        const { serverId } = this.props.serverConfig;

        return fetch(`/api/servers/${serverId}/channels`, {
            method: "GET",
            headers: { "content-type": "application/json" },
        })
            .then(errorifyResponseError)
            .then((response) => response.json())
            .then(({ serverChannels }) => this.setState({ serverChannels }))
            .catch(notifyFetchError.bind(null, "Error while fetching channel data for appeals"));
    }

    async modifyServerConfig(appealChannelId: string | null | undefined) {
        const { serverId } = this.props.serverConfig;

        return fetch(`/api/servers/${serverId}`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ appealChannelId }),
        })
            .then(errorifyResponseError)
            .catch(notifyFetchError.bind(null, "Error while updating server data for appeals"));
    }

    render() {
        const { serverConfig, highestRoleType } = this.props;
        const { serverChannels } = this.state;

        return (
            <>
                <Box className="grid gap-4">
                    <DashboardModule
                        name="Appeals"
                        description="Allows people to apply for an unban in your server."
                        icon={faPrayingHands}
                        activeClassName="from-blue-500 to-teal-500"
                        serverConfig={serverConfig}
                        prop="appealsEnabled"
                        hideBadges
                        largeHeader
                    />
                </Box>
                <Box>
                    <Typography level="title-lg" gutterBottom>
                        Information
                    </Typography>
                    <Card>
                        <CardContent>
                            <Box>
                                <Typography level="title-md" sx={{ mb: 1 }}>
                                    Server's appeal link
                                </Typography>
                                <LabsCopyInput text={`https://yoki.gg/appeals/${serverConfig.serverId}`} sx={{ width: "max-content" }} />
                                <Typography level="body-sm" sx={{ mt: 1 }}>
                                    Leave a link in your server to allow users to appeal bans in the server.
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
                {highestRoleType === RoleType.ADMIN && (
                    <Box>
                        <Typography level="title-lg" gutterBottom>
                            Configuration
                        </Typography>
                        <Card>
                            <CardContent>
                                <LabsForm
                                    id="appeals-page-form"
                                    sections={[
                                        {
                                            order: LabsFormSectionOrder.Grid,
                                            fields: [
                                                {
                                                    type: LabsFormFieldType.Select,
                                                    prop: "appealChannelId",
                                                    name: "Appeal channel",
                                                    description: "The channel where appeals will be posted and managed.",
                                                    defaultValue: serverConfig.appealChannelId,
                                                    selectableValues: channelsToSelectionOptions(serverChannels),
                                                },
                                            ],
                                        },
                                    ]}
                                    onSubmit={({ appealChannelId }) => this.modifyServerConfig(appealChannelId as string | undefined | null)}
                                />
                            </CardContent>
                        </Card>
                    </Box>
                )}
                <Stack direction="column" gap={3}>
                    <Typography level="title-lg">Appeals</Typography>
                    <DataTable<SanitizedAppeal, number>
                        itemType="ban appeals"
                        timezone={serverConfig.timezone}
                        columns={["User", "Content", "Status", "When"]}
                        getItems={this.fetchAppeals.bind(this)}
                        deleteItems={this.deleteAppeals.bind(this)}
                        ItemRenderer={AppealRow}
                        ItemMobileRenderer={AppealCard}
                        getFilterFormFields={(users) => [
                            {
                                type: LabsFormFieldType.Picker,
                                name: "Status",
                                prop: "status",
                                selectableValues: appealStatusOptions,
                                optional: true,
                                rightSideCheck: true,
                            },
                            {
                                type: LabsFormFieldType.Picker,
                                name: "User",
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
