import { Box, Card, CardContent, Stack, Typography } from "@mui/joy";
import React from "react";
import DashboardModule from "../DashboardModule";
import { DashboardPageProps } from "../pages";
import { faPrayingHands } from "@fortawesome/free-solid-svg-icons";
import DataTable from "../../DataTable";
import { SanitizedAppeal } from "../../../lib/@types/db";
import { AppealCard, AppealRow } from "./AppealItem";
import LabsForm from "../../LabsForm";
import { LabsFormFieldType } from "../../form";
import { notifyFetchError } from "../../../utils/errorUtil";

export default class AppealsPage extends React.Component<DashboardPageProps> {
    constructor(props: DashboardPageProps) {
        super(props);
    }

    getAppealsRoute(page: number, search?: string) {
        const {
            serverConfig: { serverId },
        } = this.props;

        return `/api/servers/${serverId}/appeals?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}`;
    }

    async fetchAppeals(page: number, search?: string) {
        return fetch(this.getAppealsRoute(page, search), {
            method: "GET",
            headers: { "content-type": "application/json" },
        })
            .then((response) => {
                if (!response.ok) throw response;
                return response.json();
            })
            .then(({ appeals, count }) => ({ items: appeals, maxPages: Math.ceil(count / 50) }));
    }

    async deleteAppeals(appealIds: number[], page: number, search?: string) {
        return fetch(this.getAppealsRoute(page, search), {
            method: "DELETE",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ appealIds }),
        })
            .then((response) => {
                if (!response.ok) throw response;
                return response.json();
            })
            .then(({ appeals, count }) => ({ items: appeals, maxPages: Math.ceil(count / 50) }));
    }

    async modifyServerConfig(appealChannelId: string | null | undefined) {
        const { serverId } = this.props.serverConfig;

        return fetch(`/api/servers/${serverId}`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ appealChannelId }),
        }).catch(notifyFetchError.bind(null, "Error while updating server data for role changes"));
    }

    render() {
        const { serverConfig } = this.props;

        return (
            <>
                <Box className="grid gap-4">
                    <DashboardModule
                        name="Appeals"
                        description="Allows people to apply for an unban in your server."
                        icon={faPrayingHands}
                        activeClassName="from-violet-500 to-cyan-500"
                        serverConfig={serverConfig}
                        prop="appealsEnabled"
                        hideBadges
                        largeHeader
                    />
                </Box>
                <Box>
                    <Typography level="h4" gutterBottom>
                        Appeals configuration
                    </Typography>
                    <Card>
                        <CardContent>
                            <LabsForm
                                sections={[
                                    {
                                        row: true,
                                        fields: [
                                            {
                                                type: LabsFormFieldType.Text,
                                                prop: "appealChannelId",
                                                name: "Appeal Channel",
                                                description: "The ID of the channel where appeals will be posted and managed.",
                                                defaultValue: serverConfig.appealChannelId,
                                            },
                                        ],
                                    },
                                ]}
                                onSubmit={({ appealChannelId }) => this.modifyServerConfig(appealChannelId as string | undefined | null)}
                            />
                        </CardContent>
                    </Card>
                </Box>
                <Stack direction="column" gap={3}>
                    <Typography level="h4">Appeals</Typography>
                    <DataTable<SanitizedAppeal, number>
                        itemType="ban appeals"
                        timezone={serverConfig.timezone}
                        columns={["User", "Content", "Status", "When"]}
                        getItems={this.fetchAppeals.bind(this)}
                        deleteItems={this.deleteAppeals.bind(this)}
                        ItemRenderer={AppealRow}
                        ItemMobileRenderer={AppealCard}
                    />
                </Stack>
            </>
        );
    }
}
